import React, { useState } from "react";
import {
  Search,
  X,
  Plus,
  Minus,
  User,
  ShoppingCart,
  Percent,
  Save,
  CreditCard,
  Smartphone,
  DollarSign,
  MoreVertical,
  Pin,
  GripVertical,
  Trash2,
  Edit,
} from "lucide-react";
// Logo import removed - using text-based branding instead
import { api, Item, Customer, Category, Tax } from "../api";
import { useEffect } from "react";

interface CartItem extends Item {
  quantity: number;
}

interface CheckoutProps {
  userName: string;
  userProfilePicture: string;
}

export function Checkout({
  userName,
  userProfilePicture,
}: CheckoutProps) {
  const [selectedCategory, setSelectedCategory] =
    useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    null,
  );
  const [itemQuantity, setItemQuantity] = useState(1);
  const [showCustomerModal, setShowCustomerModal] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [showCustomerInfo, setShowCustomerInfo] =
    useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Items", "Favorites"]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, categoriesData, customersData, taxesData] = await Promise.all([
          api.getInventory(),
          api.getCategories(),
          api.getCustomers(),
          api.getTaxes()
        ]);
        setItems(inventoryData);
        setCategories(["All Items", "Favorites"]); // , ...categoriesData.map((c: Category) => c.name)
        setCustomers(customersData);
        setTaxes(taxesData);
      } catch (error) {
        console.error("Failed to fetch checkout data:", error);
      }
    };
    fetchData();
  }, []);

  const paymentMethods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: Smartphone,
      color: "bg-green-500",
    },
    {
      id: "ecocash",
      name: "EcoCash",
      icon: Smartphone,
      color: "bg-blue-500",
    },
    {
      id: "cash",
      name: "Cash",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      id: "credit",
      name: "Credit Card",
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      id: "eft",
      name: "EFT",
      icon: CreditCard,
      color: "bg-indigo-500",
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Items" ||
      item.categoryName === selectedCategory;
    const matchesSearch =
      item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.sku
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: Item, quantity: number) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.id === item.id,
    );
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? {
              ...cartItem,
              quantity: cartItem.quantity + quantity,
            }
            : cartItem,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    setSelectedItem(null);
    setItemQuantity(1);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const updateCartQuantity = (
    itemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    }
  };

  const subtotal = cart.reduce(
    (sum, item: CartItem) => sum + item.price * item.quantity,
    0,
  );

  // Dynamic tax calculation based on item's tax rate
  const tax = cart.reduce(
    (sum, item: CartItem) => sum + (item.price * item.quantity * (item.taxRate || 0)),
    0
  );
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setItemQuantity(1);
  };

  const handleCheckout = () => {
    if (!selectedCustomer) {
      setShowCustomerModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const roundMoney = (value) =>
    Number((Math.round(value * 100) / 100).toFixed(2));


  const completeTransaction = async () => {
    try {
      const payload = {
        customer: selectedCustomer?.id || null,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        subtotal: roundMoney(subtotal),
        tax: roundMoney(tax),
        discount: roundMoney(discountAmount),
        total: roundMoney(total),
        status: "COMPLETED",
        items: cart.map((item: CartItem) => ({
          item: item.id,
          quantity: item.quantity,
          price_at_sale: roundMoney(item.price)
        }))
      };

      await api.createTransaction(payload);

      // Reset cart and state
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setShowPaymentModal(false);
      alert("Transaction completed successfully!");

      // Refresh inventory to update stock
      const freshInventory = await api.getInventory();
      setItems(freshInventory);
    } catch (error: any) {
      alert("Failed to complete transaction: " + error.message);
    }
  };

  const saveCart = async () => {
    try {
      const payload = {
        customer: selectedCustomer?.id || null,
        items: cart.map((item: CartItem) => ({
          item: item.id,
          quantity: item.quantity
        }))
      };
      await api.saveCart(payload);
      alert("Cart saved successfully!");
    } catch (error: any) {
      alert("Failed to save cart: " + error.message);
    }
  };

  return (
    <div className="flex-1 bg-[#ffffff] relative overflow-hidden h-screen flex">
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex">
        {/* Left Side - Items Area */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-slate-900">Checkout</h1>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors w-64"
                  />
                </div>

                {/* Customer Info */}
                {selectedCustomer ? (
                  <button
                    onClick={() => setShowCustomerInfo(true)}
                    className="flex items-center gap-2 bg-white/70 backdrop-blur-md border-2 border-[#D78B30] rounded-xl px-4 py-2 hover:bg-[#D78B30]/10 transition-colors"
                  >
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-slate-900">
                      {selectedCustomer.name}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCustomerModal(true)}
                    className="flex items-center gap-2 bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 py-2 hover:border-[#D78B30] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#D78B30]" />
                    <span className="text-sm text-[#D78B30]">
                      Add Customer
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${selectedCategory === category
                    ? "bg-[#D78B30] text-white shadow-sm"
                    : "bg-white/70 backdrop-blur-md border-2 border-white/50 text-slate-600 hover:border-[#D78B30]"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-2xl p-4 hover:border-[#D78B30] hover:shadow-lg transition-all group text-left relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle pin action
                        console.log("Pin item:", item.id);
                      }}
                      className="p-1 bg-white/80 rounded-lg hover:bg-white cursor-pointer"
                    >
                      <Pin className="w-3 h-3 text-slate-600" />
                    </div>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-slate-900 line-clamp-2 mb-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.sku}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#D78B30]">
                      M{item.price}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${item.stock > 50
                        ? "bg-green-100 text-green-700"
                        : item.stock > 20
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {item.stock} in stock
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 bg-white/70 backdrop-blur-md border-l-2 border-white/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#D78B30]" />
              <h2 className="text-slate-900">
                Cart ({cart.length})
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={saveCart}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Save Cart"
              >
                <Save className="w-4 h-4 text-slate-600" />
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  Cart is empty
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Add items to get started
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/50 rounded-xl p-3 border border-white/50"
                >
                  <div className="flex gap-3 mb-2">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 mb-1 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.sku}
                      </p>
                      <p className="text-sm text-[#D78B30] mt-1">
                        M{item.price}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors h-fit"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity - 1,
                          )
                        }
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="text-sm text-slate-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity + 1,
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                    <span className="text-sm text-slate-900">
                      M{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="space-y-4">
              {/* Discount */}
              <button
                onClick={() => {
                  const discountValue = prompt(
                    "Enter discount percentage:",
                  );
                  if (discountValue) {
                    setDiscount(
                      Math.min(
                        100,
                        Math.max(0, parseFloat(discountValue)),
                      ),
                    );
                  }
                }}
                className="flex items-center justify-between w-full text-sm text-[#D78B30] hover:bg-white/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  <span>Add Discount</span>
                </div>
                {discount > 0 && <span>{discount}% off</span>}
              </button>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>M{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (15%)</span>
                  <span>M{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-M{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-900">Total</span>
                  <span className="text-[#D78B30] text-xl">
                    M{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-[#D78B30] hover:bg-[#C4661F] text-white py-4 rounded-xl transition-colors shadow-lg"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border-2 border-white/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-900 text-xl">
                Item Details
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="aspect-square bg-slate-100 rounded-2xl mb-4 overflow-hidden">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg text-slate-900 mb-2">
                {selectedItem.name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-slate-500 mb-1">SKU</p>
                  <p className="text-slate-900">
                    {selectedItem.sku}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">
                    Category
                  </p>
                  <p className="text-slate-900">
                    {selectedItem.category}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Price</p>
                  <p className="text-[#D78B30] text-lg">
                    M{selectedItem.price}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">
                    Stock Available
                  </p>
                  <p
                    className={`${selectedItem.stock > 50
                      ? "text-green-600"
                      : selectedItem.stock > 20
                        ? "text-yellow-600"
                        : "text-red-600"
                      }`}
                  >
                    {selectedItem.stock} units
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 text-sm mb-3">
                Select Quantity
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-slate-200">
                  <button
                    onClick={() =>
                      setItemQuantity(
                        Math.max(1, itemQuantity - 1),
                      )
                    }
                    className="p-3 hover:bg-slate-50 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="text-lg text-slate-900 w-12 text-center">
                    {itemQuantity}
                  </span>
                  <button
                    onClick={() =>
                      setItemQuantity(
                        Math.min(
                          selectedItem.stock,
                          itemQuantity + 1,
                        ),
                      )
                    }
                    disabled={
                      itemQuantity >= selectedItem.stock
                    }
                    className="p-3 hover:bg-slate-50 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-slate-500 mb-1">
                    Total
                  </p>
                  <p className="text-[#D78B30] text-xl">
                    M
                    {(
                      selectedItem.price * itemQuantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                addToCart(selectedItem, itemQuantity)
              }
              className="w-full bg-[#D78B30] hover:bg-[#C4661F] text-white py-4 rounded-xl transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Select Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-900 text-xl">
                Select Customer
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setShowNewCustomerModal(true);
                }}
                className="w-full bg-[#D78B30] hover:bg-[#C4661F] text-white py-3 rounded-xl transition-colors mb-4"
              >
                + Create New Customer
              </button>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              {customers.filter((customer: Customer) =>
                customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                customer.phone.includes(customerSearchQuery)
              ).map((customer: Customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                  }}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-xl p-4 hover:border-[#D78B30] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">
                          {customer.name}
                        </p>
                        {customer.group && (
                          <span className="text-xs bg-[#D78B30]/20 text-[#D78B30] px-2 py-0.5 rounded-full">
                            {customer.group}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {customer.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border-2 border-white/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-900 text-xl">
                New Customer
              </h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Phone *
                </label>
                <input
                  type="tel"
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  placeholder="(555) 555-5555"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Customer Group
                </label>
                <select className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors">
                  <option value="">Select group</option>
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Notes (Birthday, Preferences, etc.)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D78B30] transition-colors resize-none"
                  placeholder="Add any relevant notes..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In real app, this would create the customer
                  setShowNewCustomerModal(false);
                  alert("Customer created successfully!");
                }}
                className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white py-3 rounded-xl transition-colors"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info Modal */}
      {showCustomerInfo && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-900 text-xl">
                Customer Information
              </h3>
              <button
                onClick={() => setShowCustomerInfo(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex gap-6 mb-6">
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-slate-900 text-xl">
                    {selectedCustomer.name}
                  </h4>
                  {selectedCustomer.group && (
                    <span className="text-xs bg-[#D78B30]/20 text-[#D78B30] px-3 py-1 rounded-full">
                      {selectedCustomer.group}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mb-1">
                  {selectedCustomer.email}
                </p>
                <p className="text-slate-600">
                  {selectedCustomer.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <p className="text-xs text-slate-500 mb-1">
                  Customer Since
                </p>
                <p className="text-slate-900">
                  {selectedCustomer.customerSince}
                </p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <p className="text-xs text-slate-500 mb-1">
                  Avg Spend
                </p>
                <p className="text-slate-900">
                  M{(Number(selectedCustomer.avgSpend) || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <p className="text-xs text-slate-500 mb-1">
                  Last Visit
                </p>
                <p className="text-slate-900">
                  {selectedCustomer.lastVisit ? new Date(selectedCustomer.lastVisit).toLocaleDateString() : 'New'}
                </p>
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="bg-white/50 rounded-xl p-4 border border-white/50 mb-6">
                <p className="text-xs text-slate-500 mb-2">
                  Notes
                </p>
                <p className="text-slate-900 text-sm">
                  {selectedCustomer.notes}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerInfo(false);
                }}
                className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Remove Customer
              </button>
              <button
                onClick={() => setShowCustomerInfo(false)}
                className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border-2 border-white/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-slate-900 text-xl">
                Select Payment Method
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-white/50 rounded-xl p-4 border border-white/50 mb-4">
                <p className="text-sm text-slate-500 mb-1">
                  Total Amount
                </p>
                <p className="text-3xl text-[#D78B30]">
                  M{total.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() =>
                        setSelectedPaymentMethod(method.id)
                      }
                      className={`w-full bg-white border-2 rounded-xl p-4 transition-all text-left flex items-center gap-4 ${selectedPaymentMethod === method.id
                        ? "border-[#D78B30] shadow-lg"
                        : "border-white/50 hover:border-[#D78B30]/50"
                        }`}
                    >
                      <div
                        className={`p-3 ${method.color} rounded-xl`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-900">
                        {method.name}
                      </span>
                      {selectedPaymentMethod === method.id && (
                        <div className="ml-auto w-6 h-6 bg-[#D78B30] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={completeTransaction}
                disabled={!selectedPaymentMethod}
                className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}