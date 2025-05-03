"use client"

import type React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileEdit, FileText, Trash2 } from 'lucide-react'
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface Field {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "checkbox"
  required: boolean
  options?: string[] // For select fields
}

export interface Template {
  id: string
  name: string
  description: string
  fields: Field[]
  recordCount: number
  createdAt: string,
}

// API response interface
export interface TemplateApiResponse {
  id: number
  name: string
  description: string
  fields?: Array<{
    id?: string | number
    field_name: string
    field_type: string
    is_required: boolean | number
    display_order: number
    options?: string[]
  }>
  created_at: string
  updated_at: string
  records_count: number
}

// Function to map API response to our Template interface
export const mapApiToTemplate = (data: TemplateApiResponse): Template => ({
  id: data.id.toString(),
  name: data.name,
  description: data.description,
  fields: Array.isArray(data.fields) 
    ? data.fields.map(field => ({
        id: field.id?.toString() || crypto.randomUUID(),
        name: field.field_name,
        type: field.field_type as 'text' | 'number' | 'date' | 'select' | 'checkbox',
        required: Boolean(field.is_required), // Convert to boolean to handle 0/1 values
        options: field.options,
      }))
    : [],
  recordCount: data.records_count,
  createdAt: data.created_at,
})

interface TemplateCardProps {
  template: Template
  onEdit: (template: Template) => void
  onDelete: (templateId: string) => void
  className?: string
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, className }) => {
  return (
    <Card
      className={cn("overflow-hidden transition-all duration-300 hover:shadow-glass-strong hover-scale", className)}
    >
      <CardHeader className="bg-hospital-50 border-b pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-medium text-hospital-800">{template.name}</CardTitle>
          <Badge variant="outline" className="bg-white/80 font-normal">
            {template.recordCount} {template.recordCount === 1 ? "Record" : "Records"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <p className="text-muted-foreground text-sm mb-4">{template.description}</p>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase">Fields</p>
          <div className="flex flex-wrap gap-2">
            {template.fields.map((field) => (
              <Badge key={field.id} variant="secondary" className="font-normal text-xs">
                {field.name}
                {field.required === true && <span className="text-red-500 ml-1">*</span>}
              </Badge>
            ))}
            {template.fields.length === 0 && <span className="text-xs text-muted-foreground">No fields defined</span>}
          </div>
        </div>

        {template.createdAt && (
          <div className="mt-4 text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2 pb-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 border-hospital-200 text-hospital-700 hover:bg-hospital-50"
            onClick={() => onEdit(template)}
          >
            <FileEdit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onDelete(template.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>

        <Button asChild size="sm" className="gap-1 bg-hospital-600 hover:bg-hospital-700">
          <Link to={`/records/new/${template.id}`}>
            <FileText className="h-4 w-4" />
            <span>New Record</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default TemplateCard

