"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTranslations } from "next-intl"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export default function AparienciaPage() {
  const t = useTranslations("settings.apariencia")

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "dark",
    },
  })

  function onSubmit(data: AppearanceFormValues) {
    console.log("Appearance saved:", data)
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-medium">{t("themeLabel")}</h3>
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <div className="rounded-md border-2 border-muted p-4 hover:border-accent transition-colors">
                          <div className="space-y-2">
                            <div className="w-20 h-20 bg-white border rounded-md p-3">
                              <div className="space-y-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                <div className="flex space-x-2">
                                  <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                </div>
                                <div className="flex space-x-2">
                                  <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{t("light")}</span>
                          </div>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="dark" className="sr-only" />
                        </FormControl>
                        <div className="rounded-md border-2 border-muted p-4 hover:border-accent transition-colors">
                          <div className="space-y-2">
                            <div className="w-20 h-20 bg-gray-900 border border-gray-700 rounded-md p-3">
                              <div className="space-y-2">
                                <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                                <div className="flex space-x-2">
                                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                                  <div className="h-2 bg-gray-600 rounded flex-1"></div>
                                </div>
                                <div className="flex space-x-2">
                                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                                  <div className="h-2 bg-gray-600 rounded flex-1"></div>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{t("dark")}</span>
                          </div>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" className="cursor-pointer">{t("save")}</Button>
            <Button variant="outline" type="button" className="cursor-pointer">{t("cancel")}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
