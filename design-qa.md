# Student portfolio redesign QA

- Source visuals: `/var/folders/bp/6_t36vds31147b3mgpc3wjg40000gn/T/codex-clipboard-036127db-1b40-4ae0-ab37-4ae7274d9c07.png` and `/var/folders/bp/6_t36vds31147b3mgpc3wjg40000gn/T/codex-clipboard-6c1bd42d-d7e9-4547-bd82-15d916aea13c.png`
- Prototype route: `http://localhost:3000/vo-huu-nhan`
- Desktop capture: `/private/tmp/student-portfolio-redesign-desktop.png`
- Checked viewports: desktop 1280px effective browser width; mobile 390px.

## Comparison

- P0: none. The portfolio renders with live API data and no broken images or horizontal overflow.
- P1: none. The reference's role-led hero, compact portrait, restrained navigation, pill ticker, editorial section hierarchy, bento skills, horizontal experience rows, project grid, and dark contact band are represented while retaining the SIT terracotta accent.
- P2: none. Desktop keeps the hero to 627px with a 240px portrait; mobile stacks the heading and portrait cleanly at 390px without horizontal overflow. Focus styles, semantic headings, conditional navigation, and external-link attributes are present.
- P3: the current published portfolio only contains identity and avatar data, so lower sections correctly remain hidden until projects, skills, experience, education, achievements, or contacts are added in the dashboard.

final result: passed
