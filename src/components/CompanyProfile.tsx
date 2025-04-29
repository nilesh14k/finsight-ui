// src/components/CompanyProfile.tsx
export default function CompanyProfile({ data }: { data: {
  sector: string;
  industry: string;
  country: string;
  website: string;
} }) {
  return (
    <div className="w-full max-w-sm mx-auto text-sm text-gray-700 space-y-1">
      <div>
        <span className="font-medium">Sector:</span> {data.sector}
      </div>
      <div>
        <span className="font-medium">Industry:</span> {data.industry}
      </div>
      <div>
        <span className="font-medium">Country:</span> {data.country}
      </div>
      <div>
        <span className="font-medium">Website:</span>{' '}
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          {data.website}
        </a>
      </div>
    </div>
  );
}
