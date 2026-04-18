import { Music4, SearchX } from "lucide-react";

interface TracksEmptyStateProps {
  /** True when tracks exist but none match the search query */
  isFiltered: boolean;
}

function TracksEmptyState({ isFiltered }: TracksEmptyStateProps) {
  if (isFiltered) {
    return (
      <li className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
          <SearchX className="text-muted-foreground size-6" />
        </div>

        <p className="font-medium">No results found</p>

        <p className="text-muted-foreground mt-1 text-sm">
          Try a different search term or clear the filter.
        </p>
      </li>
    );
  }

  return (
    <li className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
        <Music4 className="text-muted-foreground size-6" />
      </div>

      <p className="font-medium">No tracks yet</p>

      <p className="text-muted-foreground mt-1 text-sm">
        Generate your first track.
      </p>
    </li>
  );
}

export default TracksEmptyState;
