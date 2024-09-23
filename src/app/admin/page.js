'use client'
import { signOut } from "next-auth/react"
import Table from "@/components/Table"
import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Link from 'next/link'

export default function Admin() {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [inputPage, setInputPage] = useState(1);
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const getListdata = useCallback(async (page) => {
    try {
      const res = await fetch(`/api/admin/${view}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          page: (page - 1),
          query: searchQuery,
        })
      });
      const res_data = await res.json();
      if (!res_data?.success) {
        toast.error(res_data.message);
      } else {
        setListData(res_data.data);
        const totalPages = Math.ceil(res_data.total / 10);
        setSearchTotal(totalPages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  });

  useEffect(() => {
    getListdata(currentPage);
  }, [currentPage, view]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage > searchTotal) {
      toast.error('当前已为最后一页！');
    }
    if (nextPage <= searchTotal) {
      setCurrentPage(nextPage);
      setInputPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      setInputPage(prevPage);
    }
  };

  const handleJumpPage = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= searchTotal) {
      setCurrentPage(page);
    } else {
      toast.error('请输入有效的页码！');
    }
  };

  const handleViewToggle = () => {
    setView(view === 'list' ? 'log' : 'list');
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    getListdata(1);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="overflow-auto h-full flex w-full min-h-screen flex-col items-center justify-between">
        <header className="fixed top-0 h-[50px] left-0 w-full border-b bg-white flex z-50 justify-between items-center px-4">
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="text-white px-4 py-2 text-base transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 rounded"
              >
                菜单
              </button>
              {menuOpen && (
                <div className="absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={handleViewToggle}
                      className="block px-4 py-2 text-base text-gray-700"
                    >
                      切换到 {view === 'list' ? '日志页' : '数据页'}
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2 text-base text-gray-700"
                    >
                      登出
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link href="/">
              <button className="ml-4 text-white px-4 py-2 text-base transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 rounded">
                主页
              </button>
            </Link>
          </div>
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded p-1 text-sm w-32 mr-2"
              placeholder="搜索"
            />
            <button
              type="submit"
              className="text-white px-4 py-2 text-base transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 rounded"
            >
              搜索
            </button>
          </form>
        </header>

        <main className="my-[60px] w-9/10 sm:w-9/10 md:w-9/10 lg:w-9/10 xl:w-3/5 2xl:w-full">
          <Table data={listData} />
        </main>
        <div className="fixed inset-x-0 bottom-0 h-[50px] w-full flex z-50 justify-center items-center bg-white">
          <div className="pagination mt-5 mb-5 flex justify-center items-center">
            <button
              className="text-xs sm:text-sm transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 p-2 rounded mr-5"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span className="text-xs sm:text-sm">第 {`${currentPage}/${searchTotal}`} 页</span>
            <button
              className="text-xs sm:text-sm transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 p-2 rounded ml-5"
              onClick={handleNextPage}
            >
              下一页
            </button>
            <div className="ml-5 flex items-center">
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                className="border rounded p-2 w-20"
                placeholder="页码"
              />
              <button
                className="text-xs sm:text-sm transition ease-in-out delay-150 bg-blue-500 hover:scale-110 hover:bg-indigo-500 duration-300 p-2 rounded ml-2"
                onClick={handleJumpPage}
              >
                跳转
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
