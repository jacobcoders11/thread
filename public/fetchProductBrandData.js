Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

function fetchData(apiRoute, templateId, targetId) {
    fetch(apiRoute)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const grouped = {};
  
        data.forEach(item => {
          const key = item.name; // You can also group by ID if needed
  
          if (!grouped[key]) {
            // Copy all fields from the first instance of the product
            grouped[key] = {
              ...item,
              sizes: [item.size] // Start with the first size
            };
          } else {
            // Just add the new size
            grouped[key].sizes.push(item.size);
          }
        });
  
        const groupedData = Object.values(grouped);

        const source = document.getElementById(templateId).innerHTML;
        const template = Handlebars.compile(source);
        const html = template({ products: groupedData })
        document.getElementById(targetId).innerHTML = html;
      })

      .catch(err => console.error(`Error loading ${apiRoute}:`, err));
  }
