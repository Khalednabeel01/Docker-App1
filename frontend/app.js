const apiUrl = '/api/articles';
const form = document.getElementById('article-form');
const articlesDiv = document.getElementById('articles');
const message = document.getElementById('message');

async function loadArticles() {
  try {
    const response = await fetch(apiUrl);
    const articles = await response.json();
    articlesDiv.innerHTML = '';

    if (!articles.length) {
      articlesDiv.innerHTML = '<p>لا توجد مقالات بعد.</p>';
      return;
    }

    articles.forEach((article) => {
      const el = document.createElement('div');
      el.className = 'article';
      el.innerHTML = `<h3>${article.title}</h3><p>${article.description}</p>`;
      articlesDiv.appendChild(el);
    });
  } catch (error) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error('Failed to create article');
    }

    form.reset();
    message.textContent = 'تمت إضافة المقال بنجاح';
    loadArticles();
  } catch (error) {
    message.textContent = 'تعذر إضافة المقال';
  }
});

loadArticles();
