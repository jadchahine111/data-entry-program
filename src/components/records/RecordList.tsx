"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Template } from "@/components/template/TemplateCard"
import type { Record } from "./RecordForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Trash2, Search, FileText, Link, Pencil, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import RecordForm from "./RecordForm"
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
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RecordListProps {
  records: Record[]
  templates: Template[]
  onUpdateRecord: (record: Record) => void
  onDeleteRecord: (recordId: string) => void
  isDeleting?: boolean
}

// Define the structure of a value item in the values array
interface ValueItem {
  id: number
  record_id: number
  field_id: number
  value: string
  created_at: string
  updated_at: string
}

const RecordList: React.FC<RecordListProps> = ({
  records,
  templates,
  onUpdateRecord,
  onDeleteRecord,
  isDeleting = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("all")
  const navigate = useNavigate()

  const getTemplateById = (templateId: string): Template | undefined => {
    return templates.find((template) => template.id === templateId)
  }

  // Helper function to get a value from the values array by field_id
  const getValueByFieldId = (values: ValueItem[], fieldId: string): unknown => {
    if (!Array.isArray(values)) return ""

    const valueItem = values.find((item) => item.field_id.toString() === fieldId)
    return valueItem ? valueItem.value : ""
  }

  const filteredRecords = records.filter((record) => {
    const template = getTemplateById(record.templateId)
    if (!template) return false

    const searchLower = searchQuery.toLowerCase()

    // Search in template name
    if (template.name.toLowerCase().includes(searchLower)) return true

    // Search in record values
    if (Array.isArray(record.values)) {
      return record.values.some((item) => String(item.value).toLowerCase().includes(searchLower))
    }

    return false
  })

  const handleEditRecord = (record: Record) => {
    // Create a copy of the record
    const recordCopy = { ...record }

    // Transform values from array to object if it's an array
    if (Array.isArray(recordCopy.values)) {
      const valuesObject: { [key: string]: unknown } = {}
      recordCopy.values.forEach((item) => {
        valuesObject[item.field_id.toString()] = item.value
      })
      recordCopy.values = valuesObject
    }

    setEditingRecord(recordCopy)
  }

  const handleDeleteRecord = (recordId: string) => {
    setDeleteRecordId(recordId)
  }

  const confirmDeleteRecord = () => {
    if (deleteRecordId) {
      onDeleteRecord(deleteRecordId)
      setDeleteRecordId(null)
    }
  }

  const handleSubmitRecord = (updatedRecord: Record) => {
    onUpdateRecord(updatedRecord)
    setEditingRecord(null)
  }

  const formatFieldValue = (value: unknown, fieldType: string): React.ReactNode => {
    if (value === null || value === undefined) return ""

    switch (fieldType) {
      case "date":
        return value instanceof Date ? format(value, "PP") : String(value)
      case "checkbox":
        return value ? <CheckCircle className="h-4 w-4 text-hospital-600" /> : ""
      case "number":
        return Number(value).toString()
      default:
        return String(value)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="pt-6 pb-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="text-xl mb-2">No templates available</CardTitle>
            <p className="text-muted-foreground mb-6">Create a template before adding records</p>
          </CardContent>
        </Card>
      ) : filteredRecords.length > 0 ? (
        <div className="space-y-6">
          {filteredRecords.map((record) => {
            const template = getTemplateById(record.templateId)
            if (!template) return null

            return (
              <Card
                key={record.id}
                className="animate-fade-in hover:shadow-glass-strong transition-shadow duration-300"
              >
                <CardHeader className="bg-hospital-50 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-1 bg-white/90 text-xs font-normal">
                        {template.name}
                      </Badge>
                      <CardTitle className="text-lg font-medium text-hospital-800">
                        Record {record.id.slice(0, 8)}
                      </CardTitle>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created on {format(new Date(record.createdAt), "PPP")}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {template.fields.map((field) => {
                      const fieldValue = getValueByFieldId(Array.isArray(record.values) ? record.values : [], field.id)

                      return (
                        <div key={field.id} className="space-y-1">
                          <div className="text-sm font-medium">{field.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFieldValue(fieldValue, field.type) || "—"}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-hospital-200 text-hospital-700 hover:bg-hospital-50"
                      onClick={() => handleEditRecord(record)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          {records.length > 0 ? (
            <>
              <p className="text-muted-foreground">No records match your search</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTemplateId("all")
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No records created yet</p>
              {/* Using Button with a className instead of Link for compatibility */}
              <Button variant="link" onClick={() => navigate("/templates")} className="mt-2">
                Select a template to create records
              </Button>
            </>
          )}
        </div>
      )}

      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Update the information in this record.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <RecordForm
              template={getTemplateById(editingRecord.templateId)!}
              initialData={editingRecord}
              onSubmit={handleSubmitRecord}
              onCancel={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRecord} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RecordList