interface Response {
  value: Value[]
}

interface Value {
  carrier: string
  contactId: number
  contactName: string
  customerId: number
  extendedPrice: number
  freightOut: string
  itemId: string
  lineCancelled: boolean
  lineNumber: number
  orderCancelled: boolean
  orderDate: string
  orderNumber: number
  packingBasis: string
  parentOeLineUid: number
  poNumber: string
  quantityCancelled: number
  quantityOrdered: number
  rmaFlag: boolean
  salesTax: number
  shipDate: string
  shipToAddress: string
  shipToAddress2: string
  shipToCity: string
  shipToCountry: string
  shipToName: string
  shipToPhone: string
  shipToZip: string
  sourceLocationId: number
  termsDescription: string
  unitOfMeasure: string
  unitPrice: number
}
  

export const getOrders = async (startDate: string, endDate: string, contactIds = [], customerId:number) => {
    
  const url = 'https://testapi2.bannersolutions.com/Orders/BigCommerceHistory';
  const TOKEN = import.meta.env.VITE_BANNER_API_TOKEN;
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    startDate,
    endDate,
    contactIds,
    customerId
  });

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers,
          body
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const res:Response = await response.json(); 
      
      return await res;
  } catch (error) {
      console.error('Failed to fetch orders:', error);
      return null;
  }
};