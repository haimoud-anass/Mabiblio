import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // URL de votre backend Django
});

export const fetchBooks = () => API.get('books/');
export const fetchEvents = () => API.get('events/');