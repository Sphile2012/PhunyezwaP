import { Property } from "../types";
import { PropertyCard } from "./PropertyCard";

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({
  properties,
}: PropertyGridProps) {
  return (
    <div className="max-w-[1760px] mx-auto px-6 lg:px-20 py-8">
      {properties.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="mb-2">No properties found</h2>
          <p className="text-gray-600">
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2>Available stays</h2>
            <p className="text-gray-600 mt-1">
              {properties.length}{" "}
              {properties.length === 1
                ? "property"
                : "properties"}{" "}
              available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}