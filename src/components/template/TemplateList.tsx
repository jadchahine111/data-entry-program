"use client"

import type React from "react"
import { useState, useEffect } from "react"
import TemplateCard, { type Template, type TemplateApiResponse, type FieldOption, mapApiToTemplate } from "./TemplateCard"
import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import TemplateForm from "./TemplateForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/contexts/AuthContext"
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/AuthContext"

// Enhanced fetchTemplates function with better error handling, timeout control and batched processing
const fetchTemplates = async (): Promise<Template[]> => {
  // Create an abort controller with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    console.log("Fetching templates...");
    const { data } = await api.get<TemplateApiResponse[]>('/templates', {
      signal: controller.signal,
      timeout: 25000, // Explicit Axios timeout
    });

    // Validate the data structure before processing
    if (!Array.isArray(data)) {
      console.error("API returned invalid template data format:", data);
      throw new Error('Invalid data format received from server');
    }

    console.log(`Received ${data.length} templates from API`);

    // Process templates in smaller batches to prevent UI freezing
    const templates: Template[] = [];
    const batchSize = 10;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      // Allow UI thread to process between large batch operations
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      try {
        const processedBatch = batch.map(item => {
          try {
            return mapApiToTemplate(item);
          } catch (itemError) {
            console.warn("Error processing template item:", item, itemError);
            // Return a simplified template with minimal required data
            return {
              id: item.id?.toString() || uuidv4(),
              name: item.name || "Unnamed Template",
              description: item.description || "",
              fields: [],
              recordCount: item.records_count || 0,
              createdAt: item.created_at || new Date().toISOString(),
            };
          }
        });

        templates.push(...processedBatch);
      } catch (batchError) {
        console.error("Error processing template batch:", batchError);
      }
    }

    return templates;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error("Template request timed out:", error);
        throw new Error('Request timed out while fetching templates. Please try again.');
      }

      if (error.response?.status === 401) {
        throw error; // Let the auth handler deal with this
      }

      console.error("API error fetching templates:", error.response?.data || error.message);
      throw new Error(`Failed to fetch templates: ${error.response?.data?.message || error.message}`);
    }

    console.error("Unknown error fetching templates:", error);
    throw new Error('An unexpected error occurred while fetching templates');
  } finally {
    clearTimeout(timeoutId);
  }
};

// Improved createTemplate function with better error handling
const createTemplate = async (template: Omit<Template, 'id' | 'recordCount' | 'createdAt'>): Promise<void> => {
  console.log("Creating template:", template.name);

  // Transform the template to match the API's expected format
  const apiTemplate = {
    name: template.name,
    description: template.description,
    fields: template.fields.map((field, index) => {
      const fieldData = {
        field_name: field.name,
        field_type: field.type,
        is_required: field.required ? 1 : 0, // Convert boolean to 0/1 for API
        display_order: index + 1
      };

      // Add options if they exist
      if (field.options && field.options.length > 0) {
        const options = field.options.map((option, optIndex) => {
          if (typeof option === 'string') {
            return {
              option_name: option,
              option_value: option.toLowerCase().replace(/\s+/g, '_') + '-' + optIndex,
              display_order: optIndex + 1
            };
          } else {
            // Ensure each option has a unique value
            const value = option.option_value || `${option.option_name.toLowerCase().replace(/\s+/g, '_')}-${optIndex}`;
            return {
              option_name: option.option_name,
              option_value: value,
              display_order: typeof option.display_order === 'boolean' ? 1 : option.display_order
            };
          }
        });

        return {
          ...fieldData,
          options: options
        };
      }

      return fieldData;
    })
  };

  try {
    const response = await api.post('/templates', apiTemplate, {
      timeout: 10000 // 10 second timeout for create request
    });
    console.log("Template created successfully:", response.data);
  } catch (error) {
    console.error("Failed to create template:", error);
    throw error;
  }
};

// Improved updateTemplate function
const updateTemplate = async (template: Template): Promise<void> => {
  console.log("Updating template:", template.id);

  // Transform the template to match the API's expected format
  const apiTemplate = {
    name: template.name,
    description: template.description,
    fields: template.fields.map((field, index) => {
      const fieldData = {
        field_name: field.name,
        field_type: field.type,
        is_required: field.required ? 1 : 0, // Convert boolean to 0/1 for API
        display_order: index + 1
      };

      // Add options if they exist
      if (field.options && field.options.length > 0) {
        const options = field.options.map((option, optIndex) => {
          if (typeof option === 'string') {
            return {
              option_name: option,
              option_value: option.toLowerCase().replace(/\s+/g, '_') + '-' + optIndex,
              display_order: optIndex + 1
            };
          } else {
            // Ensure each option has a unique value
            const value = option.option_value || `${option.option_name.toLowerCase().replace(/\s+/g, '_')}-${optIndex}`;
            return {
              option_name: option.option_name,
              option_value: value,
              display_order: typeof option.display_order === 'boolean' ? 1 : option.display_order
            };
          }
        });

        return {
          ...fieldData,
          options: options
        };
      }

      return fieldData;
    })
  };

  try {
    const response = await api.put(`/templates/${template.id}`, apiTemplate, {
      timeout: 10000 // 10 second timeout for update request
    });
    console.log("Template updated successfully:", response.data);
  } catch (error) {
    console.error("Failed to update template:", error);
    throw error;
  }
};

const deleteTemplate = async (id: string): Promise<void> => {
  console.log("Deleting template:", id);
  try {
    await api.delete(`/templates/${id}`, {
      timeout: 10000 // 10 second timeout for delete request
    });
    console.log("Template deleted successfully");
  } catch (error) {
    console.error("Failed to delete template:", error);
    throw error;
  }
}

const TemplateList: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const { isLoading: isAuthLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const queryClient = useQueryClient()

  // Set mounted state to handle cleanup
  useEffect(() => {
    setIsMounted(true);
    return () => {
      console.log("TemplateList component unmounting");
      setIsMounted(false);
    };
  }, []);

  // Improved fetch templates query with better settings
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error,
    refetch,
    isError
  } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2; // Only retry twice
    },
    enabled: !isAuthLoading && isMounted,
    staleTime: 3 * 60 * 1000, // 3 minutes - don't constantly refetch
    gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache longer
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      if (isMounted) {
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        toast.success("Template created successfully");
        setIsCreateDialogOpen(false);
      }
    },
    onError: (error) => {
      if (isMounted) {
        toast.error("Failed to create template: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: () => {
      if (isMounted) {
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        toast.success("Template updated successfully");
        setEditingTemplate(null);
      }
    },
    onError: (error) => {
      if (isMounted) {
        toast.error("Failed to update template: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      if (isMounted) {
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        toast.success("Template deleted successfully");
        setDeleteTemplateId(null);
      }
    },
    onError: (error) => {
      if (isMounted) {
        toast.error("Failed to delete template: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    },
  });

  const filteredTemplates = templates.filter(
      (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDeleteTemplate = () => {
    if (deleteTemplateId) {
      deleteMutation.mutate(deleteTemplateId);
    }
  };

  const handleSubmitTemplate = (template: Template) => {
    if (editingTemplate) {
      updateMutation.mutate(template);
    } else {
      // Omit fields that will be generated by the server
      const { id, recordCount, createdAt, ...newTemplate } = template;
      createMutation.mutate(newTemplate);
    }
  };

  const handleCancelForm = () => {
    setEditingTemplate(null);
    setIsCreateDialogOpen(false);
  };

  // Handle retry with fresh data fetching
  const handleRetry = () => {
    console.log("Manually retrying template fetch");
    queryClient.removeQueries({ queryKey: ["templates"] });
    refetch();
  };

  // Handle loading state
  if (isAuthLoading || isLoadingTemplates) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-hospital-600" />
          <span className="ml-2 text-hospital-600">Loading templates...</span>
        </div>
    );
  }

  // Handle error state with improved debugging info
  if (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Template loading error:", error);

    return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Error loading templates</h2>
          <p className="text-red-600">{errorMessage}</p>
          <p className="text-sm text-red-500 mt-2">
            The server request may have completed, but there was an error processing the data.
            This might be due to large data volume or network issues.
          </p>
          <Button
              onClick={handleRetry}
              variant="outline"
              className="mt-4"
          >
            Try Again
          </Button>
        </div>
    );
  }

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search templates..."
                className="pl-9 w-full sm:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto gap-2 bg-hospital-600 hover:bg-hospital-700"
              disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4" />}
            New Template
          </Button>
        </div>

        {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                  <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDelete={handleDeleteTemplate}
                  />
              ))}
            </div>
        ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              {templates.length > 0 ? (
                  <>
                    <p className="text-muted-foreground">No templates match your search</p>
                    <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                      Clear search
                    </Button>
                  </>
              ) : (
                  <>
                    <p className="text-muted-foreground">No templates created yet</p>
                    <Button variant="link" onClick={() => setIsCreateDialogOpen(true)} className="mt-2">
                      Create your first template
                    </Button>
                  </>
              )}
            </div>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a template with custom fields to collect and organize your data.
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
                onSubmit={handleSubmitTemplate}
                onCancel={handleCancelForm}
                isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Modify your template's fields and properties.
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
                <TemplateForm
                    initialData={editingTemplate}
                    onSubmit={handleSubmitTemplate}
                    onCancel={handleCancelForm}
                    isSubmitting={updateMutation.isPending}
                />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the template and all of its records from the
                system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={confirmDeleteTemplate}
                  className="bg-destructive"
                  disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                ) : (
                    "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default TemplateList;