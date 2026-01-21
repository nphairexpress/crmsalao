import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductInput } from "@/hooks/useProducts";
import { Supplier } from "@/hooks/useSuppliers";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductInput & { id?: string; supplier_id?: string | null }) => void;
  isLoading?: boolean;
  suppliers?: Supplier[];
}

const UNIT_OPTIONS = [
  { value: "unidade", label: "Por Unidade", description: "Saída por unidade inteira" },
  { value: "ml", label: "Por ml (mililitro)", description: "Saída fracionada em ml" },
  { value: "g", label: "Por g (grama)", description: "Saída fracionada em gramas" },
];

export function ProductModal({ open, onOpenChange, product, onSubmit, isLoading, suppliers = [] }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductInput & { supplier_id?: string | null }>({
    name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    product_line: "",
    cost_price: 0,
    sale_price: 0,
    commission_percent: 0,
    current_stock: 0,
    current_stock_fractional: 0,
    min_stock: 0,
    is_active: true,
    supplier_id: null,
    unit_of_measure: "unidade",
    unit_quantity: 1,
    is_for_resale: true,
    is_for_consumption: true,
  });

  const isFractional = formData.unit_of_measure !== "unidade";
  const unitLabel = formData.unit_of_measure === "ml" ? "ml" : formData.unit_of_measure === "g" ? "g" : "un";

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        category: product.category || "",
        brand: product.brand || "",
        product_line: product.product_line || "",
        cost_price: Number(product.cost_price),
        sale_price: Number(product.sale_price),
        commission_percent: Number(product.commission_percent) || 0,
        current_stock: product.current_stock,
        current_stock_fractional: Number(product.current_stock_fractional) || 0,
        min_stock: product.min_stock,
        is_active: product.is_active,
        supplier_id: product.supplier_id || null,
        unit_of_measure: product.unit_of_measure || "unidade",
        unit_quantity: Number(product.unit_quantity) || 1,
        is_for_resale: product.is_for_resale ?? true,
        is_for_consumption: product.is_for_consumption ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        category: "",
        brand: "",
        product_line: "",
        cost_price: 0,
        sale_price: 0,
        commission_percent: 0,
        current_stock: 0,
        current_stock_fractional: 0,
        min_stock: 0,
        is_active: true,
        supplier_id: null,
        unit_of_measure: "unidade",
        unit_quantity: 1,
        is_for_resale: true,
        is_for_consumption: true,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSubmit({ ...formData, id: product.id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  // Calculate cost per unit
  const costPerUnit = formData.cost_price && formData.unit_quantity 
    ? formData.cost_price / formData.unit_quantity 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="sku">Código (SKU/EAN)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Código de barras"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_line">Linha</Label>
                  <Input
                    id="product_line"
                    value={formData.product_line}
                    onChange={(e) => setFormData({ ...formData, product_line: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Product Characteristics */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Característica do Produto</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_for_resale"
                    checked={formData.is_for_resale}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_for_resale: !!checked })}
                  />
                  <Label htmlFor="is_for_resale" className="font-normal cursor-pointer">
                    Venda
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_for_consumption"
                    checked={formData.is_for_consumption}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_for_consumption: !!checked })}
                  />
                  <Label htmlFor="is_for_consumption" className="font-normal cursor-pointer">
                    Consumo (uso em serviços)
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Valores</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Custo (R$)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Valor de Venda (R$)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_percent">Comissão (%)</Label>
                  <Input
                    id="commission_percent"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.commission_percent}
                    onChange={(e) => setFormData({ ...formData, commission_percent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Supplier and Stock Output */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Select
                    value={formData.supplier_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {suppliers
                        .filter(s => s.is_active)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_of_measure">Registro de Saída</Label>
                  <Select
                    value={formData.unit_of_measure}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      unit_of_measure: value,
                      unit_quantity: value === "unidade" ? 1 : formData.unit_quantity
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Unit Quantity - only show when fractional */}
              {isFractional && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_quantity">
                      Quantos {unitLabel} tem cada unidade?
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="unit_quantity"
                        type="number"
                        min={1}
                        step={1}
                        value={formData.unit_quantity}
                        onChange={(e) => setFormData({ ...formData, unit_quantity: parseFloat(e.target.value) || 1 })}
                        className="max-w-32"
                      />
                      <span className="text-sm text-muted-foreground">{unitLabel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ex: Se o frasco tem 1 litro, informe 1000 ml
                    </p>
                  </div>

                  {/* Cost per unit calculation */}
                  {costPerUnit > 0 && (
                    <div className="flex items-center justify-between text-sm bg-background rounded p-2">
                      <span>Custo por {unitLabel}:</span>
                      <span className="font-medium text-primary">
                        R$ {costPerUnit.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Stock */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Estoque</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Estoque Atual (unidades)</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min={0}
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Estoque Mínimo (unidades)</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min={0}
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Fractional stock */}
              {isFractional && (
                <div className="space-y-2">
                  <Label htmlFor="current_stock_fractional">
                    Estoque Fracionado ({unitLabel} restante da unidade aberta)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="current_stock_fractional"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.current_stock_fractional}
                      onChange={(e) => setFormData({ ...formData, current_stock_fractional: parseFloat(e.target.value) || 0 })}
                      className="max-w-32"
                    />
                    <span className="text-sm text-muted-foreground">{unitLabel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quantidade restante do frasco/unidade que já foi aberta
                  </p>
                </div>
              )}

              {/* Stock Summary */}
              {isFractional && formData.current_stock > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium">Total em Estoque:</p>
                  <p className="text-muted-foreground">
                    {formData.current_stock} unidades fechadas 
                    {formData.current_stock_fractional > 0 && ` + ${formData.current_stock_fractional} ${unitLabel} de frasco aberto`}
                    {" = "}
                    <span className="font-medium text-foreground">
                      {((formData.current_stock * formData.unit_quantity) + (formData.current_stock_fractional || 0)).toLocaleString("pt-BR")} {unitLabel} total
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Produto Ativo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
