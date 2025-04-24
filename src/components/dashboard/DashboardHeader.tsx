
interface DashboardHeaderProps {
  title: string;
  description: string;
}

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-purple via-brand-purple-dark to-brand-blue bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>
      <div className="w-full h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-purple-dark rounded-full md:hidden" />
    </div>
  );
};

export default DashboardHeader;
