"use client"

import type React from "react"
import { useState } from "react"
import TemplateCard, { type Template, type TemplateApiResponse, type FieldOption, mapApiToTemplate } from "./TemplateCard"
import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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

// API functions
// Update the fetchTemplates function to properly map the API response
const fetchTemplates = async (): Promise<Template[]> => {
  try {
    const { data } = await api.get<TemplateApiResponse[]>('/templates');
    return data.map(mapApiToTemplate);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }
    throw new Error('Failed to fetch templates');
  }
};

// Update the createTemplate function to match the API's expected format
const createTemplate = async (template: Omit<Template, 'id' | 'recordCount' | 'createdAt'>): Promise<void> => {
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
              option_value: option.toLowerCase().replace(/\s+/g, '_'),
              display_order: optIndex + 1
            };
          } else {
            return {
              option_name: option.option_name,
              option_value: option.option_value,
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
  
  await api.post('/templates', apiTemplate);
};

// Update the updateTemplate function to match the API's expected format
const updateTemplate = async (template: Template): Promise<void> => {
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
              option_value: option.toLowerCase().replace(/\s+/g, '_'),
              display_order: optIndex + 1
            };
          } else {
            return {
              option_name: option.option_name,
              option_value: option.option_value,
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
  
  await api.put(`/templates/${template.id}`, apiTemplate);
};

const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`/templates/${id}`)
}

const TemplateList: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const { isLoading: isAuthLoading } = useAuth();

  const queryClient = useQueryClient()

  // Fetch templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error,
    refetch
  } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !isAuthLoading
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("Template created successfully")
      setIsCreateDialogOpen(false)
    },
    onError: (error) => {
      toast.error("Failed to create template: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("Template updated successfully")
      setEditingTemplate(null)
    },
    onError: (error) => {
      toast.error("Failed to update template: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("Template deleted successfully")
      setDeleteTemplateId(null)
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setDeleteTemplateId(templateId)
  }

  const confirmDeleteTemplate = () => {
    if (deleteTemplateId) {
      deleteMutation.mutate(deleteTemplateId)
    }
  }

  const handleSubmitTemplate = (template: Template) => {
    if (editingTemplate) {
      updateMutation.mutate(template)
    } else {
      // Omit fields that will be generated by the server
      const { id, recordCount, createdAt, ...newTemplate } = template
      createMutation.mutate(newTemplate)
    }
  }

  const handleCancelForm = () => {
    setEditingTemplate(null)
    setIsCreateDialogOpen(false)
  }

  // Handle loading state
  if (isAuthLoading || isLoadingTemplates) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-hospital-600" />
        <span className="ml-2 text-hospital-600">Loading templates...</span>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h2 className="text-lg font-medium text-red-800">Error loading templates</h2>
        <p className="text-red-600">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["templates"] })}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
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
          <TemplateForm
            onSubmit={handleSubmitTemplate}
            onCancel={handleCancelForm}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl p-0">
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
  )
}

export default TemplateList

