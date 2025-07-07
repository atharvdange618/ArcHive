import axios from "axios";

export const githubParser = async (url: string) => {
  const parts = url.split("/");
  const owner = parts[3];
  const repo = parts[4];

  if (owner && repo) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await axios.get(apiUrl);
    const repoData = response.data;

    return {
      type: "link",
      title: repoData.full_name,
      description: repoData.description,
      url: repoData.html_url,
    };
  }

  return null;
};
