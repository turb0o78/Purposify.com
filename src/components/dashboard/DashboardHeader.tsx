
interface DashboardHeaderProps {
  title: string;
  description: string;
}

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full md:hidden" />
    </div>
  );
};

export default DashboardHeader;
