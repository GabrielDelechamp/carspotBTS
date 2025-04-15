"use client";

import { useState, useEffect } from "react";
import supabase from "../../../../utils/supabase";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash } from "lucide-react";

interface Brand {
  id: number;
  name: string;
  country: string;
}

const BrandsTable = () => {
  const [data, setData] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({ name: "", country: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextId, setNextId] = useState<number | null>(null);

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2" size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2" size={16} />
          ) : (
            <ArrowUpDown className="ml-2" size={16} />
          )}
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2" size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2" size={16} />
          ) : (
            <ArrowUpDown className="ml-2" size={16} />
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* Bouton Edit */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
          {/* Bouton Delete */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-500 border-red-500"
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Fonction pour obtenir le prochain ID disponible
  const fetchNextId = async () => {
    try {
      // Récupérer l'ID le plus élevé et ajouter 1
      const { data, error } = await supabase
        .from("brands")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (error) throw error;

      // Si des données existent, utilisez l'ID le plus élevé + 1, sinon commencez à 1
      const highestId = data && data.length > 0 ? data[0].id : 0;
      setNextId(highestId + 1);
    } catch (error) {
      console.error("Error fetching next ID:", error);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const start = pageIndex * pageSize;
      const end = start + pageSize - 1;

      console.log("Fetching data, range:", start, end);
      
      const { data, error, count } = await supabase
        .from("brands")
        .select("*", { count: "exact" })
        .order('name', { ascending: true })
        .range(start, end);

      if (error) throw error;

      console.log("Fetched data:", data, "count:", count);
      
      setData(data as Brand[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Error fetching brands");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  // Also update data when sorting changes
  useEffect(() => {
    if (sorting.length > 0) {
      fetchData();
    }
  }, [sorting]);

  // Reset form values when editing brand changes
  useEffect(() => {
    if (editingBrand) {
      setFormValues({
        name: editingBrand.name,
        country: editingBrand.country
      });
    } else {
      setFormValues({ name: "", country: "" });
      // Get next available ID for new brand
      fetchNextId();
    }
  }, [editingBrand]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!formValues.name || !formValues.country) {
        throw new Error("Name and country are required");
      }

      console.log("Saving brand:", editingBrand ? "update" : "create", formValues);

      if (editingBrand) {
        // Update existing brand
        const { data, error } = await supabase
          .from("brands")
          .update({
            name: formValues.name,
            country: formValues.country
          })
          .eq("id", editingBrand.id)
          .select();

        if (error) throw error;
        console.log("Updated brand:", data);
      } else {
        // Vérifie si nextId est disponible
        if (nextId === null) {
          await fetchNextId();
        }
        
        // Create new brand with explicit ID
        const { data, error } = await supabase
          .from("brands")
          .insert([{
            id: nextId,
            name: formValues.name,
            country: formValues.country
          }])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        console.log("Created brand:", data);
      }

      // Reset and close
      setIsDialogOpen(false);
      setEditingBrand(null);
      setFormValues({ name: "", country: "" });
      setNextId(null); // Reset nextId
      
      // Fetch updated data
      await fetchData();
      
    } catch (error) {
      console.error("Error saving brand:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  const handleCreateNew = () => {
    setEditingBrand(null);
    setFormValues({ name: "", country: "" });
    fetchNextId(); // Obtenir le prochain ID disponible
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Brands Table</CardTitle>
        <Button onClick={handleCreateNew}>
          New Brand
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-4">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex === 0 || isLoading}
              onClick={() => setPageIndex(pageIndex - 1)}
            >
              Previous
            </Button>
            <span>
              Page {pageIndex + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex + 1 >= Math.ceil(totalCount / pageSize) || isLoading}
              onClick={() => setPageIndex(pageIndex + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Dialog for creating/editing */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          if (!open) {
            setEditingBrand(null);
            setFormValues({ name: "", country: "" });
          }
          setIsDialogOpen(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Edit Brand" : "New Brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <Input
                name="name"
                placeholder="Name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
              <Input
                name="country"
                placeholder="Country"
                value={formValues.country}
                onChange={handleInputChange}
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting 
                  ? "Saving..." 
                  : editingBrand 
                    ? "Save Changes" 
                    : "Create Brand"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BrandsTable;