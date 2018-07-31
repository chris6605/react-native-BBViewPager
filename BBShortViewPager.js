import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ViewPagerAndroid,
    FlatList,
    Animated,
    Platform,
    Easing,
    ScrollView
} from 'react-native';

import Const from '../base/Const';

import BaseComponent from './BaseComponent';

export default class BBShortViewPager extends BaseComponent {


    path = new Animated.Value(0)

    _getSize = Const.getSize;

    itemLayout = [];

    static defaultProps = {
        titleArr: [],
        height: 50,
        bgColor: '#fff',
        fontSize: Const.getSize(16),
        fontColor: '#333333',
        selectedFontColor: '#1097d5',
        fontWeight: '400',
        showIndicator: true,
    }

    constructor(props) {
        super(props);
        this.state = {
            titleArr: this.props.titleArr,
            selectedIndex: 0,
            showIndicator: this.props.showIndicator,
        };
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {
        // 延時一會再顯示指示條 否則獲取不到 layout
        this.timer = setTimeout(() => {
            if (this.props.showIndicator) {
                this.setState({ showIndicator: true });
            } else {
                this.setState({ showIndicator: false });
            }
           
        }, 500);

    }



    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }


    //  父組件調用
    //  使用redux之後 connect 之后 这个组件会出现找不到这个方法 也就是说无法再外部通过 ref获取组件 调用这个方法 todo
    scrollToIndex(index) {
        if (Platform.OS == 'ios') {
            // ios 调用 scrollToOffset 就会调用 onMomentumScrollEnd() 所以无需再调用this.props.onScrollToIndex
            this.pagerList.scrollToOffset({
                animated: true,
                offset: Const.mScreenWidth * index
            });
        } else {
            // 安卓的viewPager 在调用 setPage的时候不会调用onPageSelected 方法 所以在这里手动调用一下
            this.viewPager.setPage(index);
            this.props.onScrollToIndex && this.props.onScrollToIndex(index);
        }
    }



    render() {
        return (
            <View style={{ ...this.props.style }} >
                {this.renderTitleBar()}
                {Platform.OS == 'ios' ? this.renderIOSViewPager() : this.renderAndroidViewPager()}
            </View >
        );
    }


    renderTitleBar() {
        return <View style={{ width: Const.mScreenWidth, height: this.props.height, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: Const.mScreenWidth, height: this.props.height, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', backgroundColor: this.props.bgColor }}>

                {
                    this.state.titleArr.map((item, index) => {
                        return <TouchableOpacity
                            key={index}
                            onLayout={(e) => {
                                this.itemLayout[index] = e.nativeEvent.layout
                            }}
                            style={{ flexDirection: 'row', height: this.props.height, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                if (Platform.OS == 'ios') {
                                    this.pagerList.scrollToOffset({
                                        animated: true,
                                        offset: Const.mScreenWidth * index
                                    });
                                } else {
                                    this.viewPager.setPage(index);
                                    this.props.onScrollToIndex && this.props.onScrollToIndex(index);
                                }

                            }}>

                            <Animated.Text style={{
                                fontSize: this.props.fontSize, fontWeight: this.props.fontWeight, textAlign: 'center',
                                color: this.path.interpolate({
                                    inputRange: [index - 1, index - 0.1, index, index + 0.1, index + 1],
                                    outputRange: [this.props.fontColor, this.props.fontColor, this.props.selectedFontColor, this.props.fontColor, this.props.fontColor]
                                })
                            }}>
                                {item}
                            </Animated.Text>


                        </TouchableOpacity>
                    })
                }

                {
                    this.state.showIndicator ? <Animated.View style={{
                        position: 'absolute', bottom: 3, left: 0, width: this.path.interpolate(
                            {
                                inputRange: [this.state.selectedIndex - 1, this.state.selectedIndex, this.state.selectedIndex + 1],
                                outputRange: [this.itemLayout[this.state.selectedIndex > 0 ? this.state.selectedIndex - 1 : 0].width, this.itemLayout[this.state.selectedIndex].width, this.itemLayout[this.state.selectedIndex == this.state.titleArr.length - 1 ? this.state.selectedIndex : this.state.selectedIndex + 1].width]
                            }
                        ), height: 3, backgroundColor: '#1097d5',
                        transform: [
                            {
                                translateX: this.path.interpolate(
                                    {
                                        inputRange: [this.state.selectedIndex - 1, this.state.selectedIndex, this.state.selectedIndex + 1],
                                        outputRange: [this.itemLayout[this.state.selectedIndex > 0 ? this.state.selectedIndex - 1 : 0].x, this.itemLayout[this.state.selectedIndex].x, this.itemLayout[this.state.selectedIndex == this.state.titleArr.length - 1 ? this.state.selectedIndex : this.state.selectedIndex + 1].x]
                                    }
                                )
                            }
                        ]
                    }}>
                    </Animated.View> : null
                }

            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: Const.mScreenWidth, height: Const.getOnePixel(), backgroundColor: Const._SEPERATORLINE_COLOR }} />
        </View>
    }


    renderIOSViewPager() {
        return <FlatList ref={ref => this.pagerList = ref}
            style={{ flex: 1 }}
            keyExtractor={(item, index) => index + '0'}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={this.state.titleArr}
            scrollEnabled={true}
            bounces={true}
            pagingEnabled={true}
            onScrollBeginDrag={(e) => {
                // 此方法只調用一次 優化加載過程中頁面顯示問題
                let offsetX = e.nativeEvent.contentOffset.x;
                this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(offsetX);
            }}
            onScroll={(e) => {
                // ios 的随动动画, 安卓也可以监听 position 碍于性能问题 会比较卡 还不如不随动
                let num = e.nativeEvent.contentOffset.x / Const.mScreenWidth
                this.path.setValue(num)
            }}
            scrollEventThrottle={1}
            onMomentumScrollEnd={(e) => {
                // 滚动动画结束的时候调用的方法 一次滚动调用一次
                // 千万不要在 onScroll 中调用 setState() 难以想象的卡顿 浪费渲染性能
                let num = Math.round(e.nativeEvent.contentOffset.x / Const.mScreenWidth);
                this.setState({ selectedIndex: num }, () => {
                    this.path.setValue(num);
                });

                this.props.onScrollToIndex && this.props.onScrollToIndex(num);

            }}
            renderItem={this.renderItem.bind(this)}
            getItemLayout={(data, index) => (
                { length: Const.mScreenWidth, offset: Const.mScreenWidth * index, index: index }
            )}
        />
    }

    
    renderItem(item) {
        let index = item.index
        return this.props.renderPage && this.props.renderPage(index)
    }


    renderAndroidViewPager() {
        return <ViewPagerAndroid ref={viewPager => this.viewPager = viewPager}
            style={{ flex: 1 }}
            initialPage={0}
            scrollEnabled={true}
            onPageSelected={(e) => {
                let num = e.nativeEvent.position
                this.setState({ selectedIndex: num }, () => {
                    this.path.setValue(num)
                });
                this.props.onScrollToIndex && this.props.onScrollToIndex(num)
            }}>
            {this.renderAndroidPage()}

        </ViewPagerAndroid>
    }


    renderAndroidPage() {
        return this.state.titleArr.map((item, index) => {
            return <View style={{ flex: 1 }}>
                {this.props.renderPage && this.props.renderPage(index)}
            </View>
        });
    }



}
