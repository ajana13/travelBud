import SwiftUI

struct LetsGoTabBar: View {
    @Binding var selectedTab: Int

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Feed", systemImage: "house.fill", value: 0) {
                Color.clear
            }
            Tab("Notifications", systemImage: "bell.fill", value: 1) {
                Color.clear
            }
            Tab("Digest", systemImage: "envelope.fill", value: 2) {
                Color.clear
            }
        }
    }
}
