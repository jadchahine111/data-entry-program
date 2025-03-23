"use client"
import { useParams, useNavigate } from "react-router-dom"
import Container from "@/components/layout/Container"
import RecordList from "@/components/records/RecordList"
import RecordForm from "@/components/records/RecordForm"
import type { Template } from "@/components/templates/TemplateCard"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define Record interface
export interface Record {
  id: string
  templateId: string
  values: { [key: string]: any }
  createdAt: string
}

// API response interface
export interface RecordApiResponse {
  id: number
  template_id: number
  values: { [key: string]: any }
  created_at: string
  updated_at: string
}

// API functions
const fetchRecords = async (): Promise<Record[]> => {
  const { data } = await axios.get<RecordApiResponse[]>("http://localhost:8000/api/records")
  return data.map((record) => ({
    id: record.id.toString(),
    templateId: record.template_id.toString(),
    values: record.values,
    createdAt: record.created_at,
  }))
}

const fetchTemplates = async (): Promise<Template[]> => {
  const { data } = await axios.get("http://localhost:8000/api/templates")
  return data.map((template: any) => ({
    id: template.id.toString(),
    name: template.name,
    description: template.description,
    fields: Array.isArray(template.fields)
      ? template.fields.map((field: any) => ({
          id: field.id?.toString() || crypto.randomUUID(),
          name: field.field_name,
          type: field.field_type,
          required: Boolean(field.is_required),
          options: field.options,
        }))
      : [],
    recordCount: template.records_count,
    createdAt: template.created_at,
  }))
}

const fetchTemplate = async (id: string): Promise<Template> => {
  const { data } = await axios.get(`http://localhost:8000/api/templates/${id}`)
  return {
    id: data.id.toString(),
    name: data.name,
    description: data.description,
    fields: Array.isArray(data.fields)
      ? data.fields.map((field: any) => ({
          id: field.id?.toString() || crypto.randomUUID(),
          name: field.field_name,
          type: field.field_type,
          required: Boolean(field.is_required),
          options: field.options,
        }))
      : [],
    recordCount: data.records_count,
    createdAt: data.created_at,
  }
}

const createRecord = async (record: Omit<Record, "id" | "createdAt">): Promise<void> => {
  // Transform the record to match the API's expected format
  const fields = Object.entries(record.values).map(([fieldId, value]) => ({
    field_id: Number.parseInt(fieldId),
    value: value,
  }))

  const apiRecord = {
    template_id: Number.parseInt(record.templateId),
    fields: fields,
  }

  await axios.post("http://localhost:8000/api/records", apiRecord)
}

const updateRecord = async (record: Record): Promise<void> => {
  // Transform the record to match the API's expected format
  const fields = Object.entries(record.values).map(([fieldId, value]) => ({
    field_id: Number.parseInt(fieldId),
    value: value,
  }))

  const apiRecord = {
    template_id: Number.parseInt(record.templateId),
    fields: fields,
  }

  await axios.put(`http://localhost:8000/api/records/${record.id}`, apiRecord)
}

const deleteRecord = async (id: string): Promise<void> => {
  await axios.delete(`http://localhost:8000/api/records/${id}`)
}

const Records = () => {
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const templateId = params.templateId

  // Fetch records
  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useQuery({
    queryKey: ["records"],
    queryFn: fetchRecords,
  })

  // Fetch templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  })

  // Fetch specific template if templateId is provided
  const {
    data: template,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
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
  if (isLoadingRecords || isLoadingTemplates) {
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

