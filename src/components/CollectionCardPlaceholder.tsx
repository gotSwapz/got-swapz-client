export const CollectionCardPlaceholder = (): JSX.Element => {
  return (
    <div className="group my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
      <article className="rounded-lg shadow-lg bg-sec-bg overflow-hidden">
        <div className="h-40 bg-gray-600 animate-pulse"></div>
        <header className="flex items-center leading-tight px-2 md:px-4">
          <div
            className="w-16 h-16 rounded-full ring-2 ring-gray-100 relative bottom-4 mr-3 
            bg-gray-800"
          />
          <h1 className="text-md"></h1>
          <div className="w-1/3 h-6 bg-gray-600 animate-pulse"></div>
        </header>
      </article>
    </div>
  );
};
