import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cartItems') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => Number(item.id) === Number(product.id));

      if (existing) {
        return prev.map((item) =>
          Number(item.id) === Number(product.id)
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + Number(product.quantity || 1),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || product.image_url || '',
          quantity: Number(product.quantity || 1),
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    const finalQty = Number(quantity);

    if (finalQty <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(id)
          ? { ...item, quantity: finalQty }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          Number(item.id) === Number(id)
            ? { ...item, quantity: Number(item.quantity || 1) - 1 }
            : item
        )
        .filter((item) => Number(item.quantity) > 0)
    );
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(id)
          ? { ...item, quantity: Number(item.quantity || 1) + 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        items: cartItems,
        addToCart,
        updateQuantity,
        updateCartQuantity: updateQuantity,
        decreaseQuantity,
        increaseQuantity,
        removeFromCart,
        removeItem: removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}