<script lang="ts">
	import '../app.pcss';
	import { MetaTags } from 'svelte-meta-tags';
	import { Toaster } from "$lib/components/ui/sonner";
</script>

<MetaTags title="SvelteKit App" />
<Toaster />
<slot />
