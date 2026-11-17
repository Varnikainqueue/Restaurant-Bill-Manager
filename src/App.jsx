
import { useState } from "react";
import "./App.css";


const categories = [
  { id: "C1", categoryName: "Platters", superCategory: { id: "SC1", superCategoryName: "South Indian" } },
  { id: "C2", categoryName: "Breads", superCategory: { id: "SC2", superCategoryName: "Indian Breads" } },
  { id: "C3", categoryName: "Main Course", superCategory: { id: "SC3", superCategoryName: "Indian Cuisine" } },
  { id: "C4", categoryName: "Dosa", superCategory: { id: "SC1", superCategoryName: "South Indian" } }
];


const menu = [
  {
    id: "item1",
    itemName: "Butter Roti",
    rate: 20,
    category: { categoryId: "C2" },
    taxes: [
      { name: "Service Charge", rate: 10, isInPercent: true },
      { name: "GST", rate: 18, isInPercent: true }
    ]
  },
  {
    id: "item2",
    itemName: "Paneer Butter Masala",
    rate: 120,
    category: { categoryId: "C3" },
    taxes: [
      { name: "Service Charge", rate: 10, isInPercent: true },
      { name: "GST", rate: 18, isInPercent: true },
      { name: "Service Tax", rate: 10, isInPercent: true }
    ]
  },
  {
    id: "item3",
    itemName: "Masala Dosai",
    rate: 50,
    category: { categoryId: "C4" },
    taxes: [
      { name: "Service Charge", rate: 10, isInPercent: true },
      { name: "GST", rate: 18, isInPercent: true }
    ]
  },
  {
    id: "item4",
    itemName: "Dosai Platter",
    rate: 150,
    category: { categoryId: "C1" },
    taxes: [
      { name: "Service Charge", rate: 10, isInPercent: true }
    ]
  }
];


const initialBill = {
  id: "B1",
  billNumber: 1,
  opentime: "06 Nov 2020 14:19",
  customerName: "CodeQuotient",
  billItems: [
    { id: "item2", quantity: 3, discount: { rate: 10, isInPercent: false } },
    { id: "item1", quantity: 15, discount: { rate: 10, isInPercent: true } },
    { id: "item4", quantity: 2, discount: { rate: 20, isInPercent: false } },
    { id: "item3", quantity: 5, discount: { rate: 5, isInPercent: true } }
  ]
};


function getBillDetails(bill) {
  return {
    id: bill.id,
    billNumber: bill.billNumber,
    opentime: bill.opentime,
    customerName: bill.customerName,
    billItems: bill.billItems.map((billItem) => {
      const item = menu.find((m) => m.id === billItem.id);

      return {
        id: billItem.id,
        name: item ? item.itemName : "Unknown Item",
        quantity: billItem.quantity
      };
    })
  };
}


function calculateBillDetails(bill) {
  let totalAmount = 0;

  const billItems = bill.billItems.map((billItem) => {
    const item = menu.find((m) => m.id === billItem.id);

    if (!item) return null;

    const category = categories.find(
      (c) => c.id === item.category.categoryId
    );

    const originalPrice = item.rate;
    const discount = billItem.discount || {
      rate: 0,
      isInPercent: false
    };

    const discountAmount = discount.isInPercent
      ? originalPrice * discount.rate / 100
      : discount.rate;

    const discountedPrice = originalPrice - discountAmount;

    
    const taxes = item.taxes || [];
    const taxAmount = taxes.reduce((sum, tax) => {
      return sum + (
        tax.isInPercent
          ? discountedPrice * tax.rate / 100
          : tax.rate
      );
    }, 0);

    const pricePerPiece = Number(
      (discountedPrice + taxAmount).toFixed(2)
    );

    const amount = Number(
      (pricePerPiece * billItem.quantity).toFixed(2)
    );

    totalAmount += amount;

    return {
      id: billItem.id,
      name: item.itemName,
      quantity: billItem.quantity,
      discount: {
        rate: discount.rate,
        isInPercent: discount.isInPercent ? "Y" : "N"
      },
      taxes: taxes.map((tax) => ({
        name: tax.name,
        rate: tax.rate,
        isInPercent: tax.isInPercent ? "Y" : "N"
      })),
      amount,
      superCategoryName: category?.superCategory?.superCategoryName || "",
      categoryName: category?.categoryName || ""
    };
  }).filter(Boolean);

  return {
    id: bill.id,
    billNumber: bill.billNumber,
    opentime: bill.opentime,
    customerName: bill.customerName,
    billItems,
    "Total Amount": Number(totalAmount.toFixed(2))
  };
}

function App() {
  const [bill, setBill] = useState(initialBill);
  const [result, setResult] = useState(() => calculateBillDetails(initialBill));
  const [showJson, setShowJson] = useState(false);

  function updateItem(index, field, value) {
    setBill((previous) => ({
      ...previous,
      billItems: previous.billItems.map((item, i) => {
        if (i !== index) return item;

        if (field === "id") {
          return { ...item, id: value };
        }

        if (field === "quantity") {
          return { ...item, quantity: Math.max(1, Number(value) || 1) };
        }

        return {
          ...item,
          discount: {
            ...item.discount,
            [field]: value
          }
        };
      })
    }));
  }

  function addItem() {
    setBill((previous) => ({
      ...previous,
      billItems: [
        ...previous.billItems,
        {
          id: "item1",
          quantity: 1,
          discount: { rate: 0, isInPercent: true }
        }
      ]
    }));
  }

  function removeItem(index) {
    setBill((previous) => ({
      ...previous,
      billItems: previous.billItems.filter((_, i) => i !== index)
    }));
  }

  function calculate() {
    setResult(calculateBillDetails(bill));
  }

  function resetBill() {
    setBill(initialBill);
    setResult(calculateBillDetails(initialBill));
    setShowJson(false);
  }

  const money = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-icon">♨</div>
        <div>
          <p className="eyebrow">RESTAURANT MANAGEMENT</p>
          <h1>Restaurant Bill Manager</h1>
          <p className="hero-subtitle">
            Calculate bills with discounts, taxes and more!
          </p>
        </div>
        <div className="hero-decoration">♜</div>
      </header>

      <main className="dashboard">
        <section className="panel input-panel">
          <div className="panel-heading">
            <span className="heading-icon">▤</span>
            <div>
              <h2>Bill Input</h2>
              <p>Manage your order details</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="form-grid">
              <label>
                Bill ID
                <input value={bill.id} readOnly />
              </label>
              <label>
                Customer Name
                <input
                  value={bill.customerName}
                  onChange={(e) =>
                    setBill({ ...bill, customerName: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="section-title">
              <h3>Bill Items</h3>
              <span>{bill.billItems.length} items</span>
            </div>

            <div className="item-list">
              {bill.billItems.map((billItem, index) => {
                const item = menu.find((m) => m.id === billItem.id);

                return (
                  <div className="item-row" key={`${index}-${billItem.id}`}>
                    <label className="item-name-field">
                      <span>Item</span>
                      <select
                        value={billItem.id}
                        onChange={(e) =>
                          updateItem(index, "id", e.target.value)
                        }
                      >
                        {menu.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.itemName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={billItem.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span>Discount</span>
                      <div className="discount-field">
                        <input
                          type="number"
                          min="0"
                          value={billItem.discount.rate}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "rate",
                              Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                        />
                        <select
                          aria-label="Discount type"
                          value={billItem.discount.isInPercent ? "percent" : "fixed"}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "isInPercent",
                              e.target.value === "percent"
                            )
                          }
                        >
                          <option value="percent">%</option>
                          <option value="fixed">₹</option>
                        </select>
                      </div>
                    </label>

                    <button
                      className="delete-button"
                      aria-label={`Remove ${item?.itemName}`}
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <button className="add-button" onClick={addItem}>
              <span>＋</span> Add Item
            </button>

            <div className="action-buttons">
              <button className="calculate-button" onClick={calculate}>
                <span>▦</span> Calculate Bill
              </button>
              <button className="reset-button" onClick={resetBill}>
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="panel summary-panel">
          <div className="summary-heading">
            <span className="check-icon">✓</span>
            <div>
              <h2>Bill Summary</h2>
              <p>Here's your calculated invoice</p>
            </div>
            <span className="invoice-number">#{bill.billNumber}</span>
          </div>

          <div className="summary-body">
            <div className="customer-strip">
              <div>
                <span className="muted-label">CUSTOMER</span>
                <strong>{bill.customerName || "Guest"}</strong>
              </div>
              <div className="status-pill">Calculated</div>
            </div>

            {result.billItems.length === 0 ? (
              <div className="empty-state">
                <span>▤</span>
                <h3>No bill items yet</h3>
                <p>Add an item to calculate your bill.</p>
              </div>
            ) : (
              <div className="summary-items">
                {result.billItems.map((item, index) => (
                  <article
                    className={`summary-item item-color-${index % 4}`}
                    key={`${item.id}-${index}`}
                  >
                    <div className="food-icon">
                      {item.categoryName === "Breads"
                        ? "🫓"
                        : item.categoryName === "Dosa" ||
                          item.categoryName === "Platters"
                        ? "🥞"
                        : "🍛"}
                    </div>
                    <div className="food-details">
                      <h3>{item.name}</h3>
                      <p>
                        @ {menu.find((m) => m.id === item.id)?.rate} ×{" "}
                        {item.quantity} ={" "}
                        <strong>{Number(item.amount).toFixed(2)}</strong>
                      </p>
                      <span>
                        {item.categoryName} · {item.superCategoryName}
                      </span>
                    </div>
                    <strong className="item-price">{money(item.amount)}</strong>
                  </article>
                ))}
              </div>
            )}

            <div className="total-card">
              <div>
                <span className="total-icon">₹</span>
                <div>
                  <span className="muted-label">GRAND TOTAL</span>
                  <h2>Total Amount</h2>
                </div>
              </div>
              <strong>{money(result["Total Amount"])}</strong>
            </div>

            <div className="summary-actions">
              <button
                className="json-button"
                onClick={() => setShowJson(!showJson)}
              >
                {showJson ? "Hide JSON" : "View JSON Output"}
              </button>
              <button
                className="copy-button"
                onClick={() => {
                  const json = JSON.stringify(result, null, 2);
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(json);
                  }
                }}
              >
                Copy JSON
              </button>
            </div>

            {showJson && (
              <pre className="json-output">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </main>

      <footer>
        <span>Restaurant Bill Manager</span>
        <span>Built with React · JavaScript</span>
      </footer>
    </div>
  );
}

export default App;
