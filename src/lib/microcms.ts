import { createClient } from "microcms-js-sdk";

export const client = createClient({
  serviceDomain: import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.PUBLIC_MICROCMS_API_KEY,
});

export type Blog = {
  id: string;
  title: string;
  description: string;
  content: string;
  eyecatch?: {
    url: string;
    height: number;
    width: number;
  };
  category?: string;
  publishedAt: string;
};

export const getBlogs = async (queries?: { limit?: number }) => {
  return await client.getList<Blog>({
    endpoint: "blog",
    queries,
  });
};

export const getBlog = async (contentId: string) => {
  return await client.getListDetail<Blog>({
    endpoint: "blog",
    contentId,
  });
};
