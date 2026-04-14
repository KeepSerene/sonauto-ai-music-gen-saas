import io
import os
import uuid
from typing import Optional

import boto3
import modal
import requests
from dotenv import load_dotenv
from pydantic import BaseModel

# ============================================================
# MODAL APP
# ============================================================

app = modal.App("sonauto")

# ============================================================
# PERSISTENT VOLUME
# ============================================================

sonauto_models_volume = modal.Volume.from_name(
    "sonauto-models-cache", create_if_missing=True
)
MODELS_CACHE_PATH = "/models-cache"

# ============================================================
# CONTAINER IMAGE
# ============================================================

image = (
    modal.Image.debian_slim()
    .apt_install("git", "ffmpeg", "libsndfile1")
    .run_commands(
        "echo 'rebuild-v6'",  # increment this any time you need to force a full rebuild
        "git clone https://github.com/ace-step/ACE-Step.git /tmp/ACE-Step",
        "cd /tmp/ACE-Step && git checkout 1bee4c9",
        "cd /tmp/ACE-Step && pip install .",
    )
    .pip_install_from_requirements("requirements.txt")
    .env({"HF_HOME": f"{MODELS_CACHE_PATH}/huggingface"})
)

# ============================================================
# SECRETS
# ============================================================

sonauto_secret = modal.Secret.from_name("sonauto-secret")

# ============================================================
# REQUEST / RESPONSE TYPES
# ============================================================


class MusicGenerationRequest(BaseModel):
    prompt: str
    lyrics: Optional[str] = None
    is_instrumental: bool = False
    audio_duration: float = 60.0
    guidance_scale: float = 15.0
    infer_step: int = 60
    seed: int = -1


class GeneratedTrackResponse(BaseModel):
    audio_url: str
    thumbnail_url: str


# ============================================================
# SONG GENERATION SERVER
# ============================================================


@app.cls(
    image=image,
    gpu="L4",
    secrets=[sonauto_secret],
    volumes={MODELS_CACHE_PATH: sonauto_models_volume},
    timeout=600,
    scaledown_window=15,
)
class SongGenServer:
    @modal.enter()
    def load_models(self):
        """
        Runs once on cold start. Loads ACE-Step and SDXL-Turbo into GPU memory.
        """
        import soundfile as sf
        import torch
        import torchaudio

        # -------------------------------------------------------
        # PATCH: torchaudio 2.11.0 defaults to torchcodec for
        # saving, which requires libnppicc.so.13 (NVIDIA NPP).
        # That library is not present in this container.
        # soundfile is already installed by ace-step and is
        # perfectly capable of saving WAV files.
        # -------------------------------------------------------
        def _save_with_soundfile(uri, src, sample_rate, *args, **kwargs):
            audio_np = src.numpy()

            if audio_np.ndim == 2:
                audio_np = audio_np.T  # (channels, samples) -> (samples, channels)

            sf.write(str(uri), audio_np, sample_rate)

        torchaudio.save = _save_with_soundfile
        # -------------------------------------------------------

        # The following import comes from the cloned ACE-Step repo
        from acestep.pipeline_ace_step import ACEStepPipeline
        from diffusers import AutoPipelineForText2Image

        # Load Audio model
        self.music_pipeline = ACEStepPipeline(
            checkpoint_dir=f"{MODELS_CACHE_PATH}/huggingface",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False,
        )

        # Load Thumbnail model
        self.thumbnail_pipeline = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir=f"{MODELS_CACHE_PATH}/huggingface",
        )
        self.thumbnail_pipeline = self.thumbnail_pipeline.to("cuda")

    def _upload_to_r2(self, file_bytes: bytes, filename: str, content_type: str) -> str:
        """
        Uploads bytes to Cloudflare R2 and returns the public URL.
        """
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto",
        )
        s3.upload_fileobj(
            io.BytesIO(file_bytes),
            os.environ["R2_BUCKET_NAME"],
            filename,
            ExtraArgs={"ContentType": content_type},
        )
        return f"{os.environ['R2_PUBLIC_URL']}/{filename}"

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_track(self, request: MusicGenerationRequest) -> GeneratedTrackResponse:
        """
        Main generation endpoint.
        """
        song_id = str(uuid.uuid4())

        # 1. === GENERATE THUMBNAIL ===
        thumbnail_prompt = f"Mesmerizing abstract alcohol ink fluid art, vibrant swirling colors capturing the mood of {request.prompt}, featuring a striking minimalist dark silhouette, premium modern music album cover design, highly aesthetic, strong atmospheric backlighting, centered composition, no text, no typography, no detailed faces, no complex 3D geometry"

        image_result = self.thumbnail_pipeline(
            prompt=thumbnail_prompt,
            num_inference_steps=2,
            guidance_scale=0.0,
        ).images[0]

        img_byte_arr = io.BytesIO()
        image_result.save(img_byte_arr, format="WEBP", quality=90)
        thumbnail_bytes = img_byte_arr.getvalue()

        thumbnail_filename = f"thumbnails/{song_id}.webp"
        thumbnail_url = self._upload_to_r2(
            thumbnail_bytes, thumbnail_filename, "image/webp"
        )

        # 2. === GENERATE AUDIO ===
        final_lyrics = "" if request.is_instrumental else (request.lyrics or "")

        tmp_dir = "/tmp/outputs"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, f"{song_id}.wav")

        self.music_pipeline(
            prompt=request.prompt,
            lyrics=final_lyrics,
            audio_duration=request.audio_duration,
            infer_step=request.infer_step,
            guidance_scale=request.guidance_scale,
            manual_seeds=[request.seed] if request.seed != -1 else None,
            save_path=file_path,
        )

        # Read generated audio and upload to R2
        with open(file_path, "rb") as f:
            audio_bytes = f.read()

        os.remove(file_path)

        audio_filename = f"audio/{song_id}.wav"
        audio_url = self._upload_to_r2(audio_bytes, audio_filename, "audio/wav")

        return GeneratedTrackResponse(
            audio_url=audio_url,
            thumbnail_url=thumbnail_url,
        )


# ================================================================
# LOCAL ENTRYPOINT
# ================================================================


@app.local_entrypoint()
def main():
    load_dotenv()
    server = SongGenServer()
    endpoint_url = server.generate_track.get_web_url()

    test_request = MusicGenerationRequest(
        prompt="country rock, folk rock, southern rock, bluegrass, country pop",
        lyrics="[verse]\nWoke up to the sunrise glow\nTook my heart and hit the road\n\n[chorus]\nRidin' on a highway to sunshine\nGot my shades and my radio on fine",
        is_instrumental=False,
        audio_duration=30,
        infer_step=60,
        guidance_scale=15.0,
    )
    headers = {
        "Modal-Key": os.getenv("MODAL_API_KEY"),
        "Modal-Secret": os.getenv("MODAL_API_SECRET"),
    }
    print(f"Sending request to Modal Dev URL: {endpoint_url} ...")

    try:
        response = requests.post(
            endpoint_url,
            json=test_request.model_dump(),
            headers=headers,
            timeout=600,
        )
        response.raise_for_status()
        result = GeneratedTrackResponse(**response.json())
        print("\n--- GENERATION SUCCESSFUL ---")
        print("Audio URL:", result.audio_url)
        print("Thumbnail URL:", result.thumbnail_url)

    except requests.exceptions.HTTPError as err:
        print("\n--- HTTP ERROR ---")
        print(err)
        print(f"Response Content: {response.text}")
    except Exception as e:
        print("\n--- GENERATION FAILED ---")
        print(f"Error: {e}")
