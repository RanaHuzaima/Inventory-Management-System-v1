const accountSid = import.meta.env.TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.TWILIO_AUTH_TOKEN;


// Function to send WhatsApp message
export const sendWhatsAppReceipt = async (toPhoneNumber:string, billDetails:any) => {
    try {
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/your_account_sid/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: '+17787173988', // Twilio WhatsApp number
          To: `${toPhoneNumber}`, // Customer's phone number
          Body: `📄 *Receipt from Inventory Pro*\n\nCustomer: ${billDetails.customer_name}\nPhone: ${billDetails.customer_phone}\n\n*Bill Details:*\nDate: ${billDetails.created_at}\nTotal: Rs. ${billDetails.total}\n\nThank you for your purchase!`,
        }),
      });
  
      const data = await response.json();
      if (data.error) {
        console.error('Error sending WhatsApp message:', data.error.message);
      } else {
        console.log('WhatsApp message sent successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  