
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { type Field, type Template } from '../templates/TemplateCard';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface Record {
  id: string;
  templateId: string;
  values: { [key: string]: any };
  createdAt: string;
}

interface RecordFormProps {
  template: Template;
  onSubmit: (record: Record) => void;
  onCancel: () => void;
  initialData?: Record;
}

const RecordForm: React.FC<RecordFormProps> = ({
  template,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const isEditMode = !!initialData;
  
  // Dynamically build the form schema based on template fields
  const buildFormSchema = () => {
    const schema: { [key: string]: any } = {};
    
    template.fields.forEach((field) => {
      switch (field.type) {
        case 'text':
          schema[field.id] = field.required
            ? z.string().min(1, { message: `${field.name} is required` })
            : z.string().optional();
          break;
        case 'number':
          schema[field.id] = field.required
            ? z.string().min(1, { message: `${field.name} is required` }).refine(
                (val) => !isNaN(Number(val)),
                { message: `${field.name} must be a number` }
              )
            : z.string().optional().refine(
                (val) => !val || !isNaN(Number(val)),
                { message: `${field.name} must be a number` }
              );
          break;
        case 'date':
          schema[field.id] = field.required
            ? z.date({ required_error: `${field.name} is required` })
            : z.date().optional();
          break;
        case 'select':
          schema[field.id] = field.required
            ? z.string({ required_error: `${field.name} is required` })
            : z.string().optional();
          break;
        case 'checkbox':
          schema[field.id] = z.boolean().optional();
          break;
        default:
          schema[field.id] = z.string().optional();
      }
    });
    
    return z.object(schema);
  };
  
  const formSchema = buildFormSchema();
  
  // Prepare default values for the form
  const getDefaultValues = () => {
    const defaultValues: { [key: string]: any } = {};
    
    template.fields.forEach((field) => {
      if (initialData && initialData.values[field.id] !== undefined) {
        defaultValues[field.id] = initialData.values[field.id];
      } else {
        switch (field.type) {
          case 'checkbox':
            defaultValues[field.id] = false;
            break;
          case 'date':
            defaultValues[field.id] = undefined;
            break;
          default:
            defaultValues[field.id] = '';
        }
      }
    });
    
    return defaultValues;
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const recordData: Record = {
      id: initialData?.id || uuidv4(),
      templateId: template.id,
      values,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    
    onSubmit(recordData);
    toast.success(isEditMode ? "Record updated successfully" : "Record created successfully");
  };
  
  const renderFieldInput = (field: Field) => {
    switch (field.type) {
      case 'text':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...formField}
                    onChange={(e) => formField.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'checkbox':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-glass animate-fade-in">
      <CardHeader className="bg-hospital-50 border-b">
        <CardTitle className="text-xl font-medium text-hospital-800">
          {isEditMode ? 'Edit Record' : 'New Record'}
        </CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {template.fields.map((field) => renderFieldInput(field))}
            </div>
          </CardContent>
          
          <CardFooter className="justify-between border-t pt-4 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-1 bg-hospital-600 hover:bg-hospital-700"
            >
              <Save className="h-4 w-4" />
              {isEditMode ? 'Update Record' : 'Save Record'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default RecordForm;
