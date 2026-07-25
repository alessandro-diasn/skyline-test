module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body || {};
  
  // Extrair identificadores principais (cobrindo tanto o form de Contato, Booking e Pool Care)
  const fullName = [body['first-name'], body['last-name']].filter(Boolean).join(' ') || body['your-name'] || body['user-name'] || body['name'] || 'New Lead';
  const email = body['your-email'] || body['user-email'] || body['email'] || '';
  const phone = body['your-phone'] || body['user-phone'] || body['phone'] || '';

  // Preparar os campos dinamicamente, ignorando chaves puramente internas
  const ignoreKeys = ['_wpcf7', '_wpcf7_version', '_wpcf7_locale', '_wpcf7_unit_tag', '_wpcf7_container_post', '_wpcf7_posted_data_hash', 's'];
  
  // Mapeamento semantico de chaves para nomes amigaveis
  const keyMap = {
      'user-name': 'Name',
      'user-email': 'Email',
      'user-phone': 'Phone',
      'name': 'Name',
      'email': 'Email',
      'phone': 'Phone',
      'your-name': 'Name',
      'your-email': 'Email',
      'your-phone': 'Phone',
      'first-name': 'First Name',
      'last-name': 'Last Name',
      'address-1': 'Address',
      'address-2': 'Address 2',
      'address-city': 'City',
      'address-state': 'State',
      'address-zip': 'Zip',
      'last-cleaning': 'Last Cleaning',
      'extra-services[]': 'Services',
      'extra-services': 'Services',
      'special-requests': 'Special Requests',
      'beds-count': 'Bedrooms',
      'baths-count': 'Bathrooms',
      'size-count': 'Property Size',
      'your-service': 'Service',
      'your-message': 'Message',
      'acceptance-marketing[]': 'Marketing Consent',
      'acceptance-marketing': 'Marketing Consent',
      'acceptance-sms[]': 'SMS Consent',
      'acceptance-sms': 'SMS Consent'
  };

  let dynamicTableRows = '';
  
  for (const [key, value] of Object.entries(body)) {
      if (ignoreKeys.includes(key)) continue;
      if (!value || value === '') continue; // Ignorar campos vazios
      
      // Formatar as chaves usando o mapa ou fallback
      let formattedKey = keyMap[key];
      if (!formattedKey) {
          formattedKey = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      // Formatar Arrays (como 'extra-services')
      let displayValue = Array.isArray(value) ? value.join(', ') : value;
      // Tratar quebras de linha em mensagens
      displayValue = typeof displayValue === 'string' ? displayValue.replace(/\n/g, '<br>') : displayValue;

      // Adicionar "sqft" para o campo size-count se ainda não tiver
      if (key === 'size-count' && !String(displayValue).toLowerCase().includes('sqft') && String(displayValue).trim() !== '') {
          displayValue = `${displayValue} sqft`;
      }

      dynamicTableRows += `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px; color: #555; text-transform: capitalize;">${formattedKey}:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${displayValue}</td>
        </tr>
      `;
  }
  
  // HTML Template
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #f7aab5; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 24px;">New Booking / Contact</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">You have received a new message from the website.</p>
            
            <table style="width: 100%; border-collapse: collapse;">
                ${dynamicTableRows}
            </table>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #888; margin: 0;">This email was generated from the Skyline Home Cleaning website.</p>
        </div>
    </div>
  `;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Skyline Home Cleaning <hi@skylinehomecleaning.net>',
        to: 'hi@skylinehomecleaning.net',
        subject: `Lead: ${fullName}`,
        html: htmlContent
      })
    });

    const data = await resendResponse.json();

    if (resendResponse.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      console.error('Resend Error:', data);
      return res.status(400).json({ error: data.message || 'Error sending email' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
