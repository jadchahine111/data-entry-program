
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@/components/layout/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ListChecks, ArrowRight, TrendingUp, Users, Hospital, Badge } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Template } from '@/components/templates/TemplateCard';
import { Record } from '@/components/records/RecordForm';
import { useQuery } from "@tanstack/react-query"
import axios from "axios"



// Type of API response
interface DashboardStats {
  templatesCount: number
  recordsCount: number
}

// Function to fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await axios.get("http://localhost:8000/api/counts")
  return data
}

function Index() {
  // Use React Query to fetch the data
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    // Optional: set default data while loading
    placeholderData: { templatesCount: 0, recordsCount: 0 },
  })

  const stats = [
    {
      title: "Templates",
      value: data?.templatesCount || 0,
      description: "Custom form templates",
      icon: <FileText className="h-5 w-5 text-hospital-600" />,
      link: "/templates",
    },
    {
      title: "Records",
      value: data?.recordsCount || 0,
      description: "Patient data entries",
      icon: <ListChecks className="h-5 w-5 text-hospital-600" />,
      link: "/records",
    },
    
  ];

    // Handle loading state
    if (isLoading) {
      return (
        <Container>
          <div className="space-y-10 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((item) => (
                <div key={item} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Container>
      )
    }
  
    // Handle error state
    if (error) {
      return (
        <Container>
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <h2 className="text-lg font-medium text-red-800">Error loading dashboard data</h2>
            <p className="text-red-600">Please try refreshing the page.</p>
          </div>
        </Container>
      )
    }

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

      </div>
    </Container>
  );
};

export default Index;
