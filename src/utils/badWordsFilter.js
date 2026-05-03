// Danh sách từ ngữ không phù hợp (tiếng Việt + tiếng Anh)
const BAD_WORDS = [
  // Tiếng Việt - chửi tục
  'đụ', 'địt', 'lồn', 'cặc', 'buồi', 'đéo', 'đĩ', 'đ.m', 'đ m', 'dm', 'vcl',
  'vkl', 'vl', 'cl', 'clm', 'đmm', 'dmm', 'đmcs', 'đmct', 'mẹ mày', 'má mày',
  'con chó', 'thằng chó', 'đồ chó', 'súc vật', 'ngu như chó', 'mẹ kiếp',
  'đù má', 'đù mẹ', 'cứt', 'cặn bã', 'thằng điên', 'con điên',
  'óc chó', 'não cá', 'đồ ngu', 'thằng ngu', 'con ngu', 'ngu vl', 'ngu vcl',
  // Tiếng Anh
  'fuck', 'f*ck', 'f**k', 'shit', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'motherfucker', 'idiot', 'moron',
  'stupid', 'dumbass', 'jackass', 'wtf', 'stfu',
];

/**
 * Thay thế từ xấu trong chuỗi bằng dấu ***
 * @param {string} text
 * @returns {{ filtered: string, hasBadWords: boolean }}
 */
function filterBadWords(text) {
  if (!text || typeof text !== 'string') return { filtered: text, hasBadWords: false };

  let filtered = text;
  let hasBadWords = false;
  const lowerText = text.toLowerCase();

  for (const word of BAD_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(lowerText)) {
      hasBadWords = true;
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
  }

  return { filtered, hasBadWords };
}

module.exports = { filterBadWords };
