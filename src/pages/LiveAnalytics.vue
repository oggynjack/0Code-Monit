<template>
    <div>
        <h1 class="mb-3">Live Traffic</h1>
        <div class="shadow-box big-padding text-center mb-4">
            <div class="row">
                <div class="col">
                    <h3>Online Visitors (last ~60s)</h3>
                    <span class="num" :class="$root.analytics.online === 0 && 'text-secondary'">{{ $root.analytics.online }}</span>
                </div>
                <div class="col">
                    <h3>Events (latest 200)</h3>
                    <span class="num text-secondary">{{ $root.analytics.events.length }}</span>
                </div>
            </div>
        </div>

        <div class="shadow-box table-shadow-box" style="overflow-x: hidden;">
            <table class="table table-borderless table-hover">
                <thead>
                    <tr>
                        <th>DateTime</th>
                        <th>URL</th>
                        <th>Referrer</th>
                        <th>Title</th>
                        <th>User Agent</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(e, idx) in $root.analytics.events" :key="idx">
                        <td><Datetime :value="e.time" /></td>
                        <td class="small text-break">
                            <div>{{ e.path || e.url }}</div>
                            <div class="text-muted">{{ e.origin }}</div>
                        </td>
                        <td class="small text-break">{{ e.referrer }}</td>
                        <td class="small text-break">{{ e.title }}</td>
                        <td class="small text-break">{{ e.ua }}</td>
                    </tr>
                    <tr v-if="$root.analytics.events.length === 0">
                        <td colspan="5">No live events yet</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import Datetime from "../components/Datetime.vue";
export default {
    components: { Datetime },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars";

.num {
    font-size: 30px;
    color: $primary;
    font-weight: bold;
    display: block;
}

.shadow-box {
    padding: 20px;
}

.small {
    font-size: 12px;
}
</style>
