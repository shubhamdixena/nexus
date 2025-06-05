"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface CategoryEditorProps {
  categoryId?: number
}

export function CategoryEditor({ categoryId }: CategoryEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
  })

  useEffect(() => {
    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  async function fetchCategory() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("blog_categories").select("*").eq("id", categoryId).single()

      if (error) {
        throw error
      }

      if (data) {
        setCategory({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
        })
      }
    } catch (error) {
      console.error("Error fetching category:", error)
      toast({
        title: "Error",
        description: "Failed to load category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target

    if (name === "name" && !categoryId) {
      // Auto-generate slug from name for new categories
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")

      setCategory((prev) => ({
        ...prev,
        [name]: value,
        slug,
      }))
    } else {
      setCategory((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)

      if (!category.name || !category.slug) {
        throw new Error("Name and slug are required")
      }

      if (categoryId) {
        // Update existing category
        const { error } = await supabase
          .from("blog_categories")
          .update({
            name: category.name,
            slug: category.slug,
            description: category.description,
          })
          .eq("id", categoryId)

        if (error) throw error

        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        // Create new category
        const { error } = await supabase.from("blog_categories").insert([
          {
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
        ])

        if (error) throw error

        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }

      // Navigate back to blog management
      router.push("/blog-management")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={category.name}
          onChange={handleChange}
          placeholder="Category name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={category.slug}
          onChange={handleChange}
          placeholder="category-slug"
          required
        />
        <p className="text-sm text-muted-foreground">Used in URLs. Use lowercase letters, numbers, and hyphens only.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={category.description}
          onChange={handleChange}
          placeholder="Category description"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : categoryId ? "Update Category" : "Create Category"}
        </Button>

        <Button type="button" variant="outline" onClick={() => router.push("/blog-management")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
