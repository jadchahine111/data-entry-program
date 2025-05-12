"use client"
import { useParams, useNavigate } from "react-router-dom"
import Container from "@/components/layout/Container"
import RecordList from "@/components/records/RecordList"
import RecordForm from "@/components/records/RecordForm"
import type { Template, Field, TemplateApiResponse as TemplateCardApiResponse } from "@/components/template/TemplateCard"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import axios from "axios"

// Define Record interface
export interface Record {
  id: string
  templateId: string
  values: { [key: string]: string | number | boolean | null }
  createdAt: string
}

// API response interface
export interface RecordApiResponse {
  id: number
  template_id: number
  values: { [key: string]: string | number | boolean | null }
  created_at: string
  updated_at: string
}

// API functions
const fetchRecords = async (): Promise<Record[]> => {
  try {
    const { data } = await api.get<RecordApiResponse[]>("/records")
  return data.map((record) => ({
    id: record.id.toString(),
    templateId: record.template_id.toString(),
    values: record.values,
    createdAt: record.created_at,
  }))
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }
    throw new Error('Failed to fetch records');
  }
}

const fetchTemplates = async (): Promise<Template[]> => {
  try {
    const { data } = await api.get<TemplateCardApiResponse[]>("/templates")
    return data.map((template) => ({
    id: template.id.toString(),
    name: template.name,
    description: template.description,
      fields: template.fields?.map(field => ({
          id: field.id?.toString() || crypto.randomUUID(),
          name: field.field_name,
        type: field.field_type as Field["type"],
          required: Boolean(field.is_required),
        options: field.options || []
      })) || [],
    recordCount: template.records_count,
      createdAt: template.created_at
  }))
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }
    throw new Error('Failed to fetch templates');
  }
}

const fetchTemplate = async (id: string): Promise<Template> => {
  try {
    const { data } = await api.get<TemplateCardApiResponse>(`/templates/${id}`)
  return {
    id: data.id.toString(),
    name: data.name,
    description: data.description,
      fields: data.fields?.map(field => ({
          id: field.id?.toString() || crypto.randomUUID(),
          name: field.field_name,
        type: field.field_type as Field["type"],
          required: Boolean(field.is_required),
        options: field.options || []
      })) || [],
    recordCount: data.records_count,
      createdAt: data.created_at
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }
    throw new Error('Failed to fetch template');
  }
}

const createRecord = async (record: Omit<Record, 'id' | 'createdAt'>): Promise<void> => {
  // Transform the record to match the API's expected format
  const fields = Object.entries(record.values).map(([fieldId, value]) => ({
    field_id: parseInt(fieldId),
    value: value
  }));

  const apiRecord = {
    template_id: parseInt(record.templateId),
    fields: fields
  };

  await api.post("/records", apiRecord);
};

const updateRecord = async (record: Record): Promise<void> => {
  // Transform the record to match the API's expected format
  const fields = Object.entries(record.values).map(([fieldId, value]) => ({
    field_id: parseInt(fieldId),
    value: value
  }));

  const apiRecord = {
    template_id: parseInt(record.templateId),
    fields: fields
  };

  await api.put(`/records/${record.id}`, apiRecord);
};

const deleteRecord = async (id: string): Promise<void> => {
  await api.delete(`/records/${id}`)
}

const Records = () => {
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isLoading: isAuthLoading } = useAuth()

  const templateId = params.templateId

  // Fetch records
  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useQuery({
    queryKey: ["records"],
    queryFn: fetchRecords,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !isAuthLoading
  })

  // Fetch templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
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

  // Fetch specific template if templateId is provided
  const {
    data: template,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId && !isAuthLoading,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    }
  })

  // Create record mutation
  const createMutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] })
      toast.success("Record created successfully")
      navigate("/records")
    },
    onError: (error) => {
      toast.error("Failed to create record: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  // Update record mutation
  const updateMutation = useMutation({
    mutationFn: updateRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] })
      toast.success("Record updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update record: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  // Delete record mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] })
      toast.success("Record deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete record: " + (error instanceof Error ? error.message : "Unknown error"))
    },
  })

  const handleCreateRecord = (record: Omit<Record, "id" | "createdAt">) => {
    createMutation.mutate(record)
  }

  const handleUpdateRecord = (updatedRecord: Record) => {
    updateMutation.mutate(updatedRecord)
  }

  const handleDeleteRecord = (recordId: string) => {
    deleteMutation.mutate(recordId)
  }

  // Handle loading state for the main data
  if (isAuthLoading || isLoadingRecords || isLoadingTemplates) {
    return (
      <Container>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-hospital-600" />
          <span className="ml-2 text-hospital-600">Loading...</span>
        </div>
      </Container>
    )
  }

  // Handle error state for the main data
  if (recordsError || templatesError) {
    return (
      <Container>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Error loading data</h2>
          <p className="text-red-600">
            {(recordsError instanceof Error ? recordsError.message : "") ||
              (templatesError instanceof Error ? templatesError.message : "An unknown error occurred")}
          </p>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["records"] })
              queryClient.invalidateQueries({ queryKey: ["templates"] })
            }}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Container>
    )
  }

  // If templateId is provided, show the form
  if (templateId) {
    // Handle loading state for the template
    if (isLoadingTemplate) {
      return (
        <Container>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-hospital-600" />
            <span className="ml-2 text-hospital-600">Loading template...</span>
          </div>
        </Container>
      )
    }

    // Handle error state for the template
    if (templateError || !template) {
      return (
        <Container>
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <h2 className="text-lg font-medium text-red-800">Error loading template</h2>
            <p className="text-red-600">
              {templateError instanceof Error
                ? templateError.message
                : "Template not found or an unknown error occurred"}
            </p>
            <Button onClick={() => navigate("/records")} variant="outline" className="mt-4">
              Back to Records
            </Button>
          </div>
        </Container>
      )
    }

    return (
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">New Record</h1>
            <p className="text-muted-foreground">Creating a new record using the {template.name} template.</p>
          </div>

          <RecordForm
            template={template}
            onSubmit={handleCreateRecord}
            onCancel={() => navigate("/records")}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="text-muted-foreground">View and manage all your data records.</p>
        </div>

        <RecordList
          records={records}
          templates={templates}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </Container>
  )
}

export default Records

