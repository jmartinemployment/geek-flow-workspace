<?php
/*
Template Name: GeekFlow Dashboard
*/
get_header();
?>

<body
  style="background-color:white;overflow-x: hidden;padding: 0;margin: 0;height:auto;width:100%;scroll-behavior: smooth;">
  <header>
    <geek-navbar></geek-navbar>
  </header>

  <main style="padding-top: 5rem;">
    <div id="gf-dashboard-view">
      <geek-flow-dashboard></geek-flow-dashboard>
    </div>
    <div id="gf-builder-view" style="display: none;">
      <div class="container-fluid py-3">
        <button id="gf-back-btn" class="btn btn-outline-secondary mb-3">&larr; Back to Dashboard</button>
      </div>
      <geek-flow-builder></geek-flow-builder>
    </div>
  </main>

  <script type="module">
    const dashboard = document.querySelector('geek-flow-dashboard');
    const builder = document.querySelector('geek-flow-builder');
    const dashboardView = document.getElementById('gf-dashboard-view');
    const builderView = document.getElementById('gf-builder-view');
    const backBtn = document.getElementById('gf-back-btn');

    dashboard.addEventListener('flowOpened', (e) => {
      builder.setAttribute('flow-id', e.detail);
      dashboardView.style.display = 'none';
      builderView.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
      builderView.style.display = 'none';
      dashboardView.style.display = 'block';
    });
  </script>

</body>
<?php
get_footer();
?>
