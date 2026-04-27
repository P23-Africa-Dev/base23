import images from "@/constants/image";

export const EmptyCollectionState = () => (
    <div className="col-span-full flex h-[40vh] flex-col items-center justify-center text-center">
        <img
            src={images.bookmark}
            className="mb-4 h-10 w-10 opacity-50"
            alt="No collections"
        />

        <h3 className="mb-1 text-sm font-semibold text-white lg:text-deepBlack">
            No collections yet
        </h3>

        <p className="max-w-[260px] text-[10px] font-light text-white/70 lg:text-xs lg:text-gray-500">
            Tap the bookmark icon on a lead to add it to your collection.
        </p>
    </div>
);
