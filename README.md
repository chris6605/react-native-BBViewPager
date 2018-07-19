# react-native-BBViewPager
this is a viewpager for ios and android , and it support scroll , you also can set a indicator on the bottom.
/**
*  BBViewPager 是支持滚动的无限个数的 titleBar
*  BBShortViewPager 是不可滚动的 只限于屏幕宽度的(如果你有需要不是屏幕宽度的也可以自定义,只是这种情况几乎没有 所有没有放出来这个属性)
*  功能方面支持下方指示条随动 指示条长度跟随title 长度变化 颜色变化
*  如果你需要在滚动到某个 Index 做一些事情 可以在 onScrollToIndex 回调方法里实现 比如网络请求
*  ios 采用的 flatList 安卓 viewPager 所以对于安卓来说是不会产生手势冲突的 如果用 flatList会跟安卓的下拉刷新手势冲突(表现出来就是下拉刷新会左右切换 Page)
**/
用法如下: <BBViewPager style={{ flex: 1 }}
                    titleArr={['世界杯', '推薦', '我的關注', '財經', '娛樂', '圖片']}
                    renderPage={this.renderPage.bind(this)}
                    onScrollToIndex={this.onScrollToIndex.bind(this)}
                />
 这些属性你可以自定义: 
 static defaultProps = {
        titleArr: [],
        height: 50,
        bgColor: '#fff',
        fontSize: Const.getSize(16),
        fontColor: '#cdcdcd',
        selectedFontColor: Const.mainColor,
        fontWeight: '400',
        itemMargin: Const.getSize(36),
    }
    
    
