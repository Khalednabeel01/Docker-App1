const apiUrl = '/api/articles';
const apiKey = 'some-api-key'; // نفس المفتاح في middleware.yaml
const form = document.getElementById('article-form');
const articlesDiv = document.getElementById('articles');
const message = document.getElementById('message');

async function loadArticles() {
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-KEY': apiKey
      }
    });
    const result = await response.json();
    
    // التعامل مع الـ response الجديد
    const articles = result.data || result;
    const source = result.source || 'unknown';
    
    articlesDiv.innerHTML = '';

    if (!articles || articles.length === 0) {
      articlesDiv.innerHTML = '<p>لا توجد مقالات بعد.</p>';
      return;
    }

    articles.forEach((article) => {
      const el = document.createElement('div');
      el.className = 'article';
      el.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <small style="color: #666; font-size: 0.85em;">📅 ${new Date(article.created_at).toLocaleDateString('ar-EG')} | 💾 من ${source === 'redis' ? '🔴 Redis (Cache)' : '🟦 MySQL (Database)'}</small>
      `;
      articlesDiv.appendChild(el);
    });
  } catch (error) {
    console.error('Error loading articles:', error);
    message.textContent = 'تعذر تحميل المقالات';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error('Failed to create article');
    }

    form.reset();
    message.textContent = '✅ تمت إضافة المقال بنجاح';
    setTimeout(() => {
      message.textContent = '';
      loadArticles();
    }, 1000);
  } catch (error) {
    console.error('Error creating article:', error);
    message.textContent = '❌ تعذر إضافة المقال';
  }
});

loadArticles();