import { Globe } from "lucide-react";
import { FormInput } from "../forms/FormInput";
import { FormSelect } from "../forms/FormSelect";
import { FormTextarea } from "../forms/FormTextarea";

export const WebCrawlerNodeConfig = ({ nodeData, updateNodeData }:any) => {
  const handleCrawl = async () => {
    const topic = nodeData?.topic;
    if (!topic) {
      alert("Please enter a topic first!");
      return;
    }

    const sourceCount = parseInt(nodeData?.sourceCount || "5");

    updateNodeData("crawling", true);
    updateNodeData("crawlProgress", "Initializing web crawl...");

    try {
      let allData = `WEB CRAWLED KNOWLEDGE BASE: "${topic}"\n`;
      allData += `Crawl Started: ${new Date().toLocaleString()}\n`;
      allData += `Target Sources: ${sourceCount}\n${"=".repeat(80)}\n\n`;

      updateNodeData("crawlProgress", "Fetching from DuckDuckGo...");
      const searchQuery = encodeURIComponent(topic);
      const ddgResponse = await fetch(
        `https://api.duckduckgo.com/?q=${searchQuery}&format=json&pretty=1&no_html=1&skip_disambig=1`
      );
      const ddgData = await ddgResponse.json();

      updateNodeData("crawlProgress", "Fetching from Wikipedia...");
      const wikiSearchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*&srlimit=${Math.min(
          sourceCount,
          10
        )}`
      );
      const wikiSearchData = await wikiSearchResponse.json();

      let wikiArticles = [];
      if (wikiSearchData.query?.search) {
        for (
          let i = 0;
          i < Math.min(3, wikiSearchData.query.search.length);
          i++
        ) {
          const article = wikiSearchData.query.search[i];
          updateNodeData(
            "crawlProgress",
            `Fetching Wikipedia article ${i + 1}/3...`
          );

          try {
            const contentResponse = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
                article.title
              )}&format=json&origin=*`
            );
            const contentData = await contentResponse.json();
            const pages = contentData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              if (pages[pageId].extract) {
                wikiArticles.push({
                  title: article.title,
                  extract: pages[pageId].extract,
                  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
                    article.title.replace(/ /g, "_")
                  )}`,
                });
              }
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (err) {
            console.error("Error fetching Wikipedia article:", err);
          }
        }
      }

      updateNodeData("crawlProgress", "Compiling data...");

      if (ddgData.Abstract || ddgData.Definition) {
        allData += `## 📚 PRIMARY OVERVIEW (DuckDuckGo)\n\n`;

        if (ddgData.Abstract) {
          allData += `**Summary:**\n${ddgData.Abstract}\n\n`;
          if (ddgData.AbstractSource)
            allData += `*Source: ${ddgData.AbstractSource}*\n`;
          if (ddgData.AbstractURL) allData += `*URL: ${ddgData.AbstractURL}*\n`;
          allData += `\n`;
        }

        if (ddgData.Definition) {
          allData += `**Definition:**\n${ddgData.Definition}\n`;
          if (ddgData.DefinitionSource)
            allData += `*Source: ${ddgData.DefinitionSource}*\n`;
          if (ddgData.DefinitionURL)
            allData += `*URL: ${ddgData.DefinitionURL}*\n`;
          allData += `\n`;
        }

        allData += `\n`;
      }

      if (wikiArticles.length > 0) {
        allData += `## 📖 DETAILED ARTICLES (Wikipedia)\n\n`;
        wikiArticles.forEach((article, idx) => {
          allData += `### Article ${idx + 1}: ${article.title}\n\n`;
          allData += `${article.extract}\n\n`;
          allData += `**Full Article:** ${article.url}\n\n`;
          allData += `${"-".repeat(80)}\n\n`;
        });
      }

      if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
        allData += `## 🔗 RELATED TOPICS\n\n`;
        const relatedCount = Math.min(
          sourceCount,
          ddgData.RelatedTopics.length
        );
        for (let i = 0; i < relatedCount; i++) {
          const topic = ddgData.RelatedTopics[i];
          if (topic.Text) {
            allData += `**${i + 1}.** ${topic.Text}\n`;
            if (topic.FirstURL) allData += `   📎 ${topic.FirstURL}\n`;
            allData += `\n`;
          }
        }
        allData += `\n`;
      }

      allData += `\n${"=".repeat(80)}\n## CRAWL SUMMARY\n\n`;
      allData += `📊 **Statistics:**\n- Sources Crawled: ${sourceCount}\n`;
      allData += `- Wikipedia Articles: ${wikiArticles.length}\n`;
      allData += `- Related Topics: ${ddgData.RelatedTopics?.length || 0}\n\n`;
      allData += `⏰ **Crawl Completed:** ${new Date().toLocaleString()}\n`;

      updateNodeData("crawledData", allData);
      updateNodeData("crawling", false);
      updateNodeData("crawlProgress", "");
      updateNodeData("lastCrawled", new Date().toLocaleString());
    } catch (error) {
      console.error("Web crawling error:", error);
      updateNodeData("crawling", false);
      updateNodeData("crawlProgress", "");
      alert("Failed to crawl web data.");
    }
  };

  return (
    <>
      <FormInput
        label="Crawler Name"
        value={nodeData?.name || ""}
        onChange={(val) => updateNodeData("name", val)}
        placeholder="Enter crawler name..."
      />
      <FormInput
        label="Topic / Search Query"
        value={nodeData?.topic || ""}
        onChange={(val:any) => updateNodeData("topic", val)}
        placeholder="e.g., Latest AI trends..."
      />
      <FormTextarea
        label="Description"
        value={nodeData?.description || ""}
        onChange={(val:any) => updateNodeData("description", val)}
        placeholder="What kind of information should be gathered?"
        rows={3}
      />
      <FormSelect
        label="Number of Sources"
        value={nodeData?.sourceCount || "5"}
        onChange={(val:any) => updateNodeData("sourceCount", val)}
        options={[
          { value: "5", label: "5 sources (Quick)" },
          { value: "10", label: "10 sources (Standard)" },
          { value: "15", label: "15 sources (Comprehensive)" },
          { value: "20", label: "20 sources (Maximum)" },
        ]}
      />
      <div>
        <button
          onClick={handleCrawl}
          disabled={nodeData?.crawling}
          className={`w-full px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            nodeData?.crawling
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          }`}
        >
          <Globe className="w-4 h-4" />
          {nodeData?.crawling
            ? nodeData?.crawlProgress || "Crawling..."
            : "Crawl Web Data"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Free APIs: DuckDuckGo + Wikipedia (no limits)
        </p>
      </div>
      {nodeData?.crawledData && (
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Crawled Data Preview
          </label>
          <div className="bg-black/50 border border-gray-800/50 rounded-xl p-4 max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {nodeData?.crawledData}
            </pre>
          </div>
          {nodeData?.lastCrawled && (
            <p className="text-xs text-gray-500 mt-2">
              Last crawled: {nodeData?.lastCrawled}
            </p>
          )}
        </div>
      )}
    </>
  );
};
