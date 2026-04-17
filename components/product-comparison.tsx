"use client"
import { getImageUrl } from "@/lib/api-config"

interface Product {
  id: number
  name: string
  price: string
  originalPrice: string
  numericPrice: number
  image: string
  badge: string
  category: string
  inStock: boolean
  rating: number
  isNew: boolean
  popularity: number
}

interface ProductComparisonProps {
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onRemoveProduct: (productId: number) => void
}

export function ProductComparison({ products, isOpen, onClose, onRemoveProduct }: ProductComparisonProps) {
  if (!isOpen || products.length === 0) return null

  const features = [
    { key: "price", label: "Price" },
    { key: "rating", label: "Rating" },
    { key: "category", label: "Category" },
    { key: "availability", label: "Availability" },
    { key: "badge", label: "Special Feature" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg border border-white/50 shadow-2xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200/50">
          <h2 className="text-2xl font-serif font-bold text-stone-800">Product Comparison</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors duration-300"
          >
            <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Products Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-4">
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-300"
                  >
                    ×
                  </button>

                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-medium text-stone-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold text-lg">{product.price}</span>
                    <span className="text-stone-400 line-through text-sm">{product.originalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200/50">
                    <th className="text-left p-4 font-medium text-stone-800">Features</th>
                    {products.map((product) => (
                      <th key={product.id} className="text-center p-4 font-medium text-stone-800 min-w-[200px]">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={feature.key} className={index % 2 === 0 ? "bg-stone-50/50" : ""}>
                      <td className="p-4 font-medium text-stone-700">{feature.label}</td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-center">
                          {feature.key === "price" && (
                            <div className="space-y-1">
                              <div className="text-amber-600 font-bold">{product.price}</div>
                              <div className="text-stone-400 line-through text-sm">{product.originalPrice}</div>
                            </div>
                          )}
                          {feature.key === "rating" && (
                            <div className="flex items-center justify-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-amber-400" : "text-stone-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-stone-600">({product.rating})</span>
                            </div>
                          )}
                          {feature.key === "category" && (
                            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">
                              {product.category}
                            </span>
                          )}
                          {feature.key === "availability" && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          )}
                          {feature.key === "badge" && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                              {product.badge}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-all duration-300"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
