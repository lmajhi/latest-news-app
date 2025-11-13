import SideBarCategories from "@/components/SideBarCategories";
import ArticleCard from "@/components/ArticleCard";

import { getArticles } from "@/common/utils";

export const dynamic = "force-dynamic"; 



export default async function CategoryPage({ params }: {params: string}) {
  const { category } = await params;
  const articles = await getArticles(category);

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
      <SideBarCategories/>

      <main className="flex-1 p-4">
        <div className="bg-gray-600 text-white text-center py-20 mb-6 rounded">
        { category}
        </div>

        <div className="space-y-4">
          {articles?.map((article, idx) => (
            <ArticleCard key={idx} article={article}/>
          ))}
        </div>
      </main>
    </div>
  );
}