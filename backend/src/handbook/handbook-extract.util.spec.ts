import { linesToHtml } from './handbook-extract.util';

describe('linesToHtml', () => {
  it('maps numbering scheme to headings, bullets to lists, rest to paragraphs', () => {
    const html = linesToHtml([
      { text: 'I. Hội đồng cố vấn', size: 14 },
      { text: 'Đây là đoạn giới thiệu về hội đồng.', size: 12 },
      { text: '1. Đăng ký môn học', size: 13 },
      { text: '- Kiểm tra thời khóa biểu', size: 12 },
      { text: '- Đối chiếu học phần', size: 12 },
      { text: '1.1 Sinh viên tự xây dựng kế hoạch', size: 12 },
      { text: 'Nội dung chi tiết của kế hoạch học tập.', size: 12 },
    ]);

    expect(html).toContain('<h2>I. Hội đồng cố vấn</h2>');
    expect(html).toContain('<h3>1. Đăng ký môn học</h3>');
    expect(html).toContain('<h3>1.1 Sinh viên tự xây dựng kế hoạch</h3>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Kiểm tra thời khóa biểu</li>');
    expect(html).toContain('<p>Nội dung chi tiết của kế hoạch học tập.</p>');
    // list must be closed before the following heading
    expect(html.indexOf('</ul>')).toBeLessThan(html.indexOf('<h3>1.1'));
  });

  it('treats single-letter "C." as a sub-item (h3), not a roman heading', () => {
    // "C" is a roman numeral (100) but here it is an A/B/C/D sub-list marker.
    const html = linesToHtml([
      { text: 'V. Lưu trú', size: 14 },
      { text: 'C. Quy định về việc sử dụng nhà ăn', size: 12 },
    ]);
    expect(html).toContain('<h2>V. Lưu trú</h2>');
    expect(html).toContain('<h3>C. Quy định về việc sử dụng nhà ăn</h3>');
    expect(html).not.toContain('<h2>C.');
  });

  it('escapes HTML special characters', () => {
    const html = linesToHtml([{ text: 'a < b & c > d', size: 12 }]);
    expect(html).toBe('<p>a &lt; b &amp; c &gt; d</p>');
  });

  it('handles empty input', () => {
    expect(linesToHtml([])).toBe('<p></p>');
  });

  it('drops standalone page-number lines', () => {
    const html = linesToHtml([
      { text: 'Nội dung thật', size: 12 },
      { text: '1', size: 12 },
      { text: '42', size: 12 },
    ]);
    expect(html).toBe('<p>Nội dung thật</p>');
  });

  it('drops the whole front matter (cover + table of contents)', () => {
    const html = linesToHtml([
      { text: 'ĐẠI HỌC TÂN TẠO', size: 18 },
      { text: 'SỔ TAY SINH VIÊN', size: 18 },
      { text: 'Mục lục', size: 14 },
      { text: 'I. Hội đồng cố vấn ............................ 4', size: 12 },
      { text: 'II. Ban Giám hiệu ........................... 4', size: 12 },
      // real content begins here (no leader dots)
      { text: 'I. Hội đồng cố vấn', size: 14 },
      { text: 'TS. Đặng Thị Hoàng Yến', size: 12 },
    ]);
    // Cover + Mục lục + both TOC entries are gone.
    expect(html).not.toContain('SỔ TAY SINH VIÊN');
    expect(html).not.toContain('Mục lục');
    expect(html).not.toContain('...');
    expect((html.match(/Hội đồng cố vấn/g) ?? []).length).toBe(1);
    // Real content survives.
    expect(html).toContain('<h2>I. Hội đồng cố vấn</h2>');
    expect(html).toContain('<p>TS. Đặng Thị Hoàng Yến</p>');
  });
});
