"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Import Supabase realtime services
import { ScholarshipRealtimeService, type Scholarship } from "@/lib/realtime-services"
import { useToast } from "@/hooks/use-toast"

// Add the import for BulkDataOperations at the top of the file
import { BulkDataOperations } from "./bulk-data-operations"

// Template for bulk import
const scholarshipImportTemplate: Partial<Scholarship>[] = [
	{
		title: "Example Scholarship",
		provider: "Example Organization",
		organization: "Example Organization",
		country: "Country",
		amount: "$10,000",
		deadline: "2025-01-01",
		degree: "Masters",
		field: "Any",
		status: "active",
		apply_url: "https://example.com/apply",
		official_url: "https://example.com/scholarship",
		scholarship_type: "merit",
		eligibility_criteria: ["Academic Excellence"],
		requirements: ["Academic Transcripts"],
		coverage: "partial",
		renewable: false,
		target_countries: ["Country"],
		target_programs: ["Masters"],
		description: "Example scholarship description",
	},
]

export function AdminScholarshipsManagement() {
	const [scholarships, setScholarships] = useState<Scholarship[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
	const [isAddScholarshipOpen, setIsAddScholarshipOpen] = useState(false)
	const [isEditScholarshipOpen, setIsEditScholarshipOpen] = useState(false)
	const [isDeleteScholarshipOpen, setIsDeleteScholarshipOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const { toast } = useToast()

	// Load scholarships from Supabase
	const loadScholarships = async (page = 1, search = "") => {
		try {
			setLoading(true)
			const response = await ScholarshipRealtimeService.getScholarships({
				page,
				limit: 10,
				search,
				sortBy: "deadline",
				sortOrder: "asc",
			})

			setScholarships(response.data)
			setTotalPages(response.pagination.totalPages)
			setCurrentPage(page)
		} catch (error) {
			console.error("Error loading scholarships:", error)
			toast({
				title: "Error",
				description: "Failed to load scholarships. Please try again.",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	// Load data on component mount
	useEffect(() => {
		loadScholarships()
	}, [])

	// Handle search with debouncing
	useEffect(() => {
		const timer = setTimeout(() => {
			loadScholarships(1, searchTerm)
		}, 500)

		return () => clearTimeout(timer)
	}, [searchTerm])

	// Filter scholarships based on search term (now handled by database)
	const filteredScholarships = scholarships

	// Handle adding a new scholarship
	const handleAddScholarship = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const form = e.target as HTMLFormElement
			const formData = new FormData(form)

			const newScholarshipData = {
				title: formData.get("title") as string,
				provider: formData.get("organization") as string,
				organization: formData.get("organization") as string,
				country: formData.get("country") as string,
				amount: formData.get("amount") as string,
				deadline: formData.get("deadline") as string,
				degree: formData.get("degree") as string,
				field: formData.get("field") as string,
				apply_url: formData.get("applyUrl") as string,
				official_url: formData.get("officialUrl") as string,
				scholarship_type: formData.get("scholarshipType") as string || "merit",
				status: "active" as const,
				description: formData.get("description") as string || "",
				eligibility_criteria: [],
				requirements: [],
				coverage: formData.get("coverage") as string || "partial",
				renewable: formData.get("renewable") === "true",
				target_countries: [formData.get("country") as string],
				target_programs: [formData.get("degree") as string],
			}

			await ScholarshipRealtimeService.createScholarship(newScholarshipData)

			// Reload data to show the new scholarship
			await loadScholarships(currentPage, searchTerm)

			setIsAddScholarshipOpen(false)

			toast({
				title: "Scholarship Added",
				description: `${newScholarshipData.title} has been successfully added.`,
			})
		} catch (error) {
			console.error("Error creating scholarship:", error)
			toast({
				title: "Error",
				description: "Failed to add new scholarship. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle editing a scholarship
	const handleEditScholarship = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedScholarship) return

		setIsSubmitting(true)

		try {
			const form = e.target as HTMLFormElement
			const formData = new FormData(form)

			const updatedScholarshipData = {
				...selectedScholarship,
				title: formData.get("title") as string,
				provider: formData.get("organization") as string,
				organization: formData.get("organization") as string,
				country: formData.get("country") as string,
				amount: formData.get("amount") as string,
				deadline: formData.get("deadline") as string,
				degree: formData.get("degree") as string,
				field: formData.get("field") as string,
				apply_url: formData.get("applyUrl") as string,
				official_url: formData.get("officialUrl") as string,
				scholarship_type: formData.get("scholarshipType") as string || "merit",
				status: formData.get("status") as "active" | "inactive",
				description: formData.get("description") as string || "",
				coverage: formData.get("coverage") as string || "partial",
				renewable: formData.get("renewable") === "true",
			}

			await ScholarshipRealtimeService.updateScholarship(selectedScholarship.id, updatedScholarshipData)

			// Reload data to reflect changes
			await loadScholarships(currentPage, searchTerm)

			setSelectedScholarship(null)
			setIsEditScholarshipOpen(false)

			toast({
				title: "Scholarship Updated",
				description: `${updatedScholarshipData.title} has been successfully updated.`,
			})
		} catch (error) {
			console.error("Error updating scholarship:", error)
			toast({
				title: "Update Failed",
				description: "Failed to update scholarship information. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle deleting a scholarship
	const handleDeleteScholarship = async () => {
		if (!selectedScholarship) return

		setIsSubmitting(true)

		try {
			await ScholarshipRealtimeService.deleteScholarship(selectedScholarship.id)

			const scholarshipName = selectedScholarship.title

			// Reload data to reflect deletion
			await loadScholarships(currentPage, searchTerm)

			setSelectedScholarship(null)
			setIsDeleteScholarshipOpen(false)

			toast({
				title: "Scholarship Deleted",
				description: `${scholarshipName} has been successfully removed.`,
			})
		} catch (error) {
			console.error("Error deleting scholarship:", error)
			toast({
				title: "Delete Failed",
				description: "Failed to delete scholarship. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle bulk import of scholarships
	const handleBulkImportScholarships = async (importedScholarships: Partial<Scholarship>[]) => {
		try {
			// Validate imported data
			const validationErrors: string[] = []

			importedScholarships.forEach((scholarship, index) => {
				if (!scholarship.title) validationErrors.push(`Row ${index + 1}: Scholarship title is required`)
				if (!scholarship.organization) validationErrors.push(`Row ${index + 1}: Organization is required`)
				if (!scholarship.country) validationErrors.push(`Row ${index + 1}: Country is required`)
				if (!scholarship.amount) validationErrors.push(`Row ${index + 1}: Amount is required`)
			})

			if (validationErrors.length > 0) {
				toast({
					title: "Import Failed",
					description: `${validationErrors.length} validation errors found. Please check your data.`,
					variant: "destructive",
				})
				console.error("Validation errors:", validationErrors)
				return
			}

			// Create scholarships one by one (could be optimized with batch insert)
			for (const scholarshipData of importedScholarships) {
				await ScholarshipRealtimeService.createScholarship({
					...scholarshipData,
					status: scholarshipData.status || "active",
					provider: scholarshipData.organization || "",
					eligibility_criteria: scholarshipData.eligibility_criteria || [],
					requirements: scholarshipData.requirements || [],
					target_countries: scholarshipData.target_countries || [],
					target_programs: scholarshipData.target_programs || [],
				} as Partial<Scholarship>)
			}

			// Reload data to show imported scholarships
			await loadScholarships(currentPage, searchTerm)

			toast({
				title: "Import Successful",
				description: `${importedScholarships.length} scholarships have been imported.`,
			})
		} catch (error) {
			console.error("Error importing scholarships:", error)
			toast({
				title: "Import Failed",
				description: "Failed to import scholarships. Please check your data format and try again.",
				variant: "destructive",
			})
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
					<div>
						<CardTitle className="text-2xl">Scholarship Management</CardTitle>
						<CardDescription>Manage scholarship listings and details.</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						<BulkDataOperations
							entityType="Scholarships"
							onImport={handleBulkImportScholarships}
							exportData={scholarships}
							importTemplate={scholarshipImportTemplate}
						/>
						<Button onClick={() => setIsAddScholarshipOpen(true)} className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							Add Scholarship
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between mb-4">
						<div className="relative w-full max-w-sm">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search scholarships..."
								className="pl-8 w-full"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Organization</TableHead>
									<TableHead>Country</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Deadline</TableHead>
									<TableHead>Degree</TableHead>
									<TableHead>Field</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[80px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={9} className="text-center py-6">
											<div className="flex items-center justify-center">
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Loading scholarships...
											</div>
										</TableCell>
									</TableRow>
								) : filteredScholarships.length > 0 ? (
									filteredScholarships.map((scholarship) => (
										<TableRow key={scholarship.id}>
											<TableCell className="font-medium">{scholarship.title}</TableCell>
											<TableCell>{scholarship.organization}</TableCell>
											<TableCell>{scholarship.country}</TableCell>
											<TableCell>{scholarship.amount}</TableCell>
											<TableCell>{new Date(scholarship.deadline).toLocaleDateString()}</TableCell>
											<TableCell>{scholarship.degree}</TableCell>
											<TableCell>{scholarship.field}</TableCell>
											<TableCell>
												<Badge variant={scholarship.status === "active" ? "default" : "secondary"}>
													{scholarship.status === "active" ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => {
																setSelectedScholarship(scholarship)
																setIsEditScholarshipOpen(true)
															}}
														>
															<Edit className="mr-2 h-4 w-4" /> Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => {
																setSelectedScholarship(scholarship)
																setIsDeleteScholarshipOpen(true)
															}}
															className="text-red-600 dark:text-red-400"
														>
															<Trash2 className="mr-2 h-4 w-4" /> Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={9} className="h-24 text-center">
											No scholarships found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => loadScholarships(currentPage - 1, searchTerm)}
									disabled={currentPage <= 1 || loading}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => loadScholarships(currentPage + 1, searchTerm)}
									disabled={currentPage >= totalPages || loading}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Scholarship Dialog */}
			<Dialog open={isAddScholarshipOpen} onOpenChange={setIsAddScholarshipOpen}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Add New Scholarship</DialogTitle>
						<DialogDescription>Add a new scholarship listing to the platform.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleAddScholarship}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="title">Title*</Label>
									<Input id="title" name="title" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="organization">Organization*</Label>
									<Input id="organization" name="organization" required />
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="country">Country*</Label>
									<Input id="country" name="country" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="amount">Amount*</Label>
									<Input id="amount" name="amount" placeholder="e.g., $10,000" required />
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="deadline">Deadline*</Label>
									<Input id="deadline" name="deadline" type="date" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="degree">Degree*</Label>
									<Select name="degree">
										<SelectTrigger>
											<SelectValue placeholder="Select degree level" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Bachelors">Bachelors</SelectItem>
											<SelectItem value="Masters">Masters</SelectItem>
											<SelectItem value="PhD">PhD</SelectItem>
											<SelectItem value="Any">Any</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="field">Field*</Label>
									<Input id="field" name="field" placeholder="e.g., Engineering, Any" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="scholarshipType">Type</Label>
									<Select name="scholarshipType">
										<SelectTrigger>
											<SelectValue placeholder="Select scholarship type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="merit">Merit-based</SelectItem>
											<SelectItem value="need">Need-based</SelectItem>
											<SelectItem value="athletic">Athletic</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="coverage">Coverage</Label>
									<Select name="coverage">
										<SelectTrigger>
											<SelectValue placeholder="Select coverage" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="full">Full</SelectItem>
											<SelectItem value="partial">Partial</SelectItem>
											<SelectItem value="tuition-only">Tuition Only</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="renewable">Renewable</Label>
									<Select name="renewable">
										<SelectTrigger>
											<SelectValue placeholder="Is renewable?" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="true">Yes</SelectItem>
											<SelectItem value="false">No</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">Description</Label>
								<Textarea id="description" name="description" rows={3} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="applyUrl">Apply URL*</Label>
								<Input id="applyUrl" name="applyUrl" type="url" required />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="officialUrl">Official URL*</Label>
								<Input id="officialUrl" name="officialUrl" type="url" required />
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddScholarshipOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Adding..." : "Add Scholarship"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Scholarship Dialog */}
			<Dialog open={isEditScholarshipOpen} onOpenChange={setIsEditScholarshipOpen}>
				<DialogContent className="sm:max-w-[525px]">
					<DialogHeader>
						<DialogTitle>Edit Scholarship</DialogTitle>
						<DialogDescription>Update the scholarship information.</DialogDescription>
					</DialogHeader>
					{selectedScholarship && (
						<form onSubmit={handleEditScholarship}>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="edit-title">Title</Label>
									<Input id="edit-title" name="title" defaultValue={selectedScholarship.title} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-organization">Organization</Label>
									<Input
										id="edit-organization"
										name="organization"
										defaultValue={selectedScholarship.organization}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-country">Country</Label>
									<Input id="edit-country" name="country" defaultValue={selectedScholarship.country} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-amount">Amount</Label>
									<Input id="edit-amount" name="amount" defaultValue={selectedScholarship.amount} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-deadline">Deadline</Label>
									<Input id="edit-deadline" name="deadline" defaultValue={selectedScholarship.deadline} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-degree">Degree</Label>
									<Input id="edit-degree" name="degree" defaultValue={selectedScholarship.degree} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-field">Field</Label>
									<Input id="edit-field" name="field" defaultValue={selectedScholarship.field} required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-applyUrl">Apply URL</Label>
									<Input
										id="edit-applyUrl"
										name="applyUrl"
										type="url"
										defaultValue={selectedScholarship.applyUrl}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-officialUrl">Official URL</Label>
									<Input
										id="edit-officialUrl"
										name="officialUrl"
										type="url"
										defaultValue={selectedScholarship.officialUrl}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-status">Status</Label>
									<Select name="status" defaultValue={selectedScholarship.status}>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="inactive">Inactive</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setIsEditScholarshipOpen(false)}>
									Cancel
								</Button>
								<Button type="submit">Save Changes</Button>
							</DialogFooter>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Scholarship Dialog */}
			<Dialog open={isDeleteScholarshipOpen} onOpenChange={setIsDeleteScholarshipOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Scholarship</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this scholarship? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{selectedScholarship && (
						<div className="py-4">
							<p className="font-medium">{selectedScholarship.title}</p>
							<p className="text-sm text-muted-foreground">
								{selectedScholarship.organization}, {selectedScholarship.country}
							</p>
						</div>
					)}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setIsDeleteScholarshipOpen(false)}>
							Cancel
						</Button>
						<Button type="button" variant="destructive" onClick={handleDeleteScholarship}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
