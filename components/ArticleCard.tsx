import { removeCharacterCount } from "@/common/utils"
type Article = {

    "source": {
        "id": string,
        "name": string
    },
    "author": string,
    "title": string,
    "description": string,
    "url": string,
    "urlToImage": string,
    "publishedAt": string,
    "content": string,
}

/**
 * const mockResponse = {
  "status": "ok",
  "totalResults": 37,
  "articles": [
    {
      "source": {
        "id": "cnn",
        "name": "CNN"
      },
      "author": "Associated Press",
      "title": "All 14 victims identified from fiery UPS cargo plane crash in Louisville - CNN",
      "description": "All 14 victims identified from fiery UPS cargo plane crash in Louisville",
      "url": "https://www.cnn.com/2025/11/12/us/louisville-ups-plane-crash-victims",
      "urlToImage": "https://media.cnn.com/api/v1/images/stellar/prod/ap25312084385487.jpg?c=16x9&q=w_800,c_fill",
      "publishedAt": "2025-11-12T23:57:26Z",
      "content": "A grandfather and his young granddaughter. An electrician with two young children. A woman standing in line at a scrap metal business.\r\nThey were among the 14 people who died in the fiery crash of a … [+3133 chars]"
    },
  ]
}
 */

const ArticleCard = ({article}: {article: Article}) => {
    return <div key={article.publishedAt} className="flex gap-4">
        <div className="w-16 h-16 bg-gray-400 text-white flex items-center justify-center text-xs">
            <img alt={`${article.title} Image`} height={200} width={100} src={article.urlToImage} />
        </div>
        <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{article.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{article?.source?.name} | {article.author}</p>
            <p className="text-sm text-gray-700">
                {removeCharacterCount(article.content) || article.description} <a className="text-blue-500 hover:text-blue-700 underline" href={article.url} target={"_blank"}>Link</a>
            </p>

        </div>
    </div>
}

export default ArticleCard;
