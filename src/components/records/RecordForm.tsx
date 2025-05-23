"use client"

import type React from "react"
import { useState } from "react"
import type { Template, Field, FieldOption } from "@/components/template/TemplateCard"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { v4 as uuidv4 } from "uuid"
import { Check, Loader2, X } from "lucide-react"

export interface Record {
  id: string
  templateId: string
  values: { [key: string]: unknown }
  createdAt: string
}

interface RecordFormProps {
  template: Template
  initialData?: Record
  onSubmit: (record: Record | Omit<Record, "id" | "createdAt">) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const RecordForm: React.FC<RecordFormProps> = ({ template, initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [values, setValues] = useState<{ [key: string]: unknown }>(initialData?.values || {})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleChange = (fieldId: string, value: unknown) => {
    setValues({
      ...values,
      [fieldId]: value,
    })

    // Clear error when field is changed
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: "",
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    template.fields.forEach((field) => {
      if (field.required && (values[field.id] === undefined || values[field.id] === "")) {
        newErrors[field.id] = "This field is required"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const record = initialData
      ? {
          ...initialData,
          values,
        }
      : {
          id: uuidv4(),
          templateId: template.id,
          values,
          createdAt: new Date().toISOString(),
        }

    onSubmit(record)
  }

  // Helper function to handle option display and values 
  const getOptionData = (option: string | FieldOption) => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option
      };
    }
    return {
      label: option.option_name,
      value: option.option_value
    };
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={values[field.id] as string || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={errors[field.id] ? "border-red-500" : ""}
          />
        )
      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={values[field.id] as string || ""}
            onChange={(e) => handleChange(field.id, e.target.value ? Number(e.target.value) : "")}
            className={errors[field.id] ? "border-red-500" : ""}
          />
        )
      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={values[field.id] as string || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={errors[field.id] ? "border-red-500" : ""}
          />
        )
      case "select":
        return (
          <Select 
            value={values[field.id] as string || ""} 
            onValueChange={(value) => handleChange(field.id, value)}
          >
            <SelectTrigger className={errors[field.id] ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const { label, value } = getOptionData(option);
                return (
                  <SelectItem key={`${value}-${index}`} value={value}>
                    {label}
                </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup 
            value={values[field.id] as string || ""} 
            onValueChange={(value) => handleChange(field.id, value)}
          >
            {field.options?.map((option, index) => {
              const { label, value } = getOptionData(option);
              return (
                <div key={`${value}-${index}`} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`${field.id}-${value}`} />
                  <Label htmlFor={`${field.id}-${value}`}>{label}</Label>
                </div>
              );
            })}
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={values[field.id] as boolean || false}
              onCheckedChange={(checked) => handleChange(field.id, checked)}
            />
            <label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes
            </label>
          </div>
        )
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={values[field.id] as boolean || false}
              onCheckedChange={(checked) => handleChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>
              {values[field.id] ? "Yes" : "No"}
            </Label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-glass animate-fade-in">
      <CardHeader className="bg-hospital-50 border-b">
        <CardTitle className="text-xl font-medium text-hospital-800">
          {initialData ? "Edit Record" : "Create New Record"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {template.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="flex items-center">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
            </div>
          ))}
        </CardContent>

        <CardFooter className="justify-between border-t pt-4 pb-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="gap-1">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" className="gap-1 bg-hospital-600 hover:bg-hospital-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {initialData ? "Update Record" : "Create Record"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default RecordForm

