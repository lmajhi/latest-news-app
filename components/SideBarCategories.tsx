import Link from "next/link";


const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

const SideBarCategories = () => {
  return (
    <aside className="w-48 bg-white border-r p-4 space-y-4">
        <div className="border rounded">
          {categories.map((category, i) => (
            <div key={category} className={`p-2 border-b last:border-b-0 ${i === 0 ? 'rounded-t' : ''} ${i === 4 ? 'rounded-b' : ''}`}>
              {/* {category} */}
              <Link key={i} href={`/news/${category}`}>{category}</Link>
            </div>
            
          ))}
        </div>
      </aside>
  )

}


export default SideBarCategories;
