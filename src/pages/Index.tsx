
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@/components/layout/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ListChecks, ArrowRight, TrendingUp, Users, Hospital, Badge } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Template } from '@/components/templates/TemplateCard';
import { Record } from '@/components/records/RecordForm';

const Index = () => {
  const [templates] = useLocalStorage<Template[]>('templates', []);
  const [records] = useLocalStorage<Record[]>('records', []);

  const stats = [
    {
      title: "Templates",
      value: templates.length,
      description: "Custom form templates",
      icon: <FileText className="h-5 w-5 text-hospital-600" />,
      link: "/templates",
    },
    {
      title: "Records",
      value: records.length,
      description: "Patient data entries",
      icon: <ListChecks className="h-5 w-5 text-hospital-600" />,
      link: "/records",
    },
  ];

  return (
    <Container>
      <div className="space-y-10 animate-fade-in">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to MediForm</h1>
            <p className="text-muted-foreground">
              Create customized data entry forms for your hospital.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-glass transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hospital-100">
                    <span className="text-hospital-700 font-medium text-sm">{stat.value}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{stat.description}</CardDescription>
                  <Button asChild variant="link" className="p-0 h-auto mt-2 text-hospital-600 hover:text-hospital-800">
                    <Link to={stat.link} className="flex items-center gap-1">
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden border-hospital-100 hover:shadow-glass transition-shadow duration-300">
            <div className="absolute right-0 top-0 h-20 w-20 overflow-hidden">
              <div className="absolute right-0 top-0 opacity-30">
                <FileText className="h-28 w-28 text-hospital-200 -translate-y-4 translate-x-4" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-medium">Create Template</CardTitle>
              <CardDescription>
                Design customized forms for different departments or procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Create reusable form templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Customize fields for specific needs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Organize and manage all templates</span>
                </div>
              </div>
              <Button asChild className="bg-hospital-600 hover:bg-hospital-700 mt-2">
                <Link to="/templates">
                  Manage Templates <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-hospital-100 hover:shadow-glass transition-shadow duration-300">
            <div className="absolute right-0 top-0 h-20 w-20 overflow-hidden">
              <div className="absolute right-0 top-0 opacity-30">
                <ListChecks className="h-28 w-28 text-hospital-200 -translate-y-4 translate-x-4" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-medium">Enter Records</CardTitle>
              <CardDescription>
                Quickly input and manage patient data using your templates
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Fast data entry with custom templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Maintain accurate patient records</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-hospital-600" />
                  <span>Review and update existing data</span>
                </div>
              </div>
              <Button asChild className="bg-hospital-600 hover:bg-hospital-700 mt-2">
                <Link to="/records">
                  Manage Records <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-hospital-50 -mx-8 px-8 py-10 border-y">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <Badge className="bg-white font-normal px-3 py-1 text-xs">
                Streamlined Medical Forms
              </Badge>
              <h2 className="text-2xl font-bold">Simplify Your Hospital Data Management</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MediForm helps medical professionals create customized data collection forms
                while maintaining consistent records across departments.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-8">
              {[
                {
                  icon: <Hospital className="h-8 w-8 text-hospital-600" />,
                  title: "Departmental Flexibility",
                  description: "Create specialized forms for different hospital departments and needs."
                },
                {
                  icon: <TrendingUp className="h-8 w-8 text-hospital-600" />,
                  title: "Consistent Data",
                  description: "Maintain data consistency with standardized, reusable templates."
                },
                {
                  icon: <Users className="h-8 w-8 text-hospital-600" />,
                  title: "Patient-Centric",
                  description: "Organize records by patient, procedure, or any custom criteria."
                }
              ].map((feature, i) => (
                <Card key={i} className="bg-white border-none hover:shadow-glass transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-hospital-50">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Index;
