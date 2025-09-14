import { useState } from 'react';


export default function usePagination(initialPage = 1) {
const [page, setPage] = useState(initialPage);
const [totalPages, setTotalPages] = useState(1);
const next = () => setPage((p) => Math.min(p + 1, totalPages));
const prev = () => setPage((p) => Math.max(p - 1, 1));
const setTotalFromMeta = (meta) => {
if (!meta) return;
const { total, per_page } = meta; // prilagodi backend metapodatke
setTotalPages(Math.max(1, Math.ceil(total / per_page)));
};
return { page, setPage, totalPages, setTotalPages, next, prev, setTotalFromMeta };
}