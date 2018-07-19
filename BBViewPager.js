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

export default class BBViewPager extends BaseComponent {


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
        itemMargin: Const.getSize(35),
    }

    constructor(props) {
        super(props);
        this.state = {
            titleArr: this.props.titleArr,
            selectedIndex: 0,
            showIndicator: false,
        };
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {
        // 延時一會再顯示指示條 否則獲取不到 layout
        this.timer = setTimeout(() => {
            this.setState({ showIndicator: true });
        }, 500);

    }



    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }


    //  父組件調用
    scrollToIndex(index) {
        if (Platform.OS == 'ios') {
            this.pagerList.scrollToOffset({
                animated: true,
                offset: Const.mScreenWidth * index
            });
        } else {
            this.viewPager.setPage(index);
            this.props.onScrollToIndex(index)
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
            <ScrollView ref={ref => this.scroll = ref}
                style={{ width: Const.mScreenWidth, height: this.props.height, backgroundColor: this.props.bgColor }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}>

                {
                    this.state.titleArr.map((item, index) => {
                        return <TouchableOpacity
                            key={index}
                            onLayout={(e) => {
                                this.itemLayout[index] = e.nativeEvent.layout
                            }}
                            style={{ flexDirection: 'row', height: this.props.height, justifyContent: 'center', alignItems: 'center', marginLeft: index == 0 ? this._getSize(20) : this.props.itemMargin, marginRight: index == this.state.titleArr.length - 1 ? this._getSize(20) : 0 }}
                            onPress={() => {
                                if (Platform.OS == 'ios') {
                                    this.pagerList.scrollToOffset({
                                        animated: true,
                                        offset: Const.mScreenWidth * index
                                    });
                                } else {
                                    this.viewPager.setPage(index);
                                }

                            }}>

                            <Animated.Text style={{
                                fontSize: this.props.fontSize, fontWeight: this.props.fontWeight, textAlign: 'center',
                                color: this.path.interpolate({
                                    inputRange: [index - 1, index - 0.1, index, index + 0.1, index + 1],
                                    outputRange: [this.props.fontColor, this.props.fontColor, this.props.selectedFontColor, this.props.fontColor, this.props.fontColor]
                                })
                            }}>
                                {item}<Text style={{ color: '#f00736' }}>{this.props.from == 'iberCarePage' && index == 2 && this.props.new_order && this.props.new_order != 0 ? '(' + this.props.new_order + ')' : null}</Text>
                            </Animated.Text>


                        </TouchableOpacity>
                    })
                }

                {
                    this.state.showIndicator ? <Animated.View style={{
                        position: 'absolute', bottom: 2, left: 0, width: this.path.interpolate(
                            {
                                inputRange: [this.state.selectedIndex - 1, this.state.selectedIndex, this.state.selectedIndex + 1],
                                outputRange: [this.itemLayout[this.state.selectedIndex > 0 ? this.state.selectedIndex - 1 : 0].width, this.itemLayout[this.state.selectedIndex].width, this.itemLayout[this.state.selectedIndex == this.state.titleArr.length - 1 ? this.state.selectedIndex : this.state.selectedIndex + 1].width]
                            }
                        ), height: 2, backgroundColor: '#1097d5',
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

            </ScrollView>
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
                let num = offsetX / Const.mScreenWidth;
                this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(offsetX);
            }}
            onScroll={(e) => {
                let num = e.nativeEvent.contentOffset.x / Const.mScreenWidth
                this.path.setValue(num)
            }}
            scrollEventThrottle={1}
            onMomentumScrollEnd={(e) => {
                let num = Math.round(e.nativeEvent.contentOffset.x / Const.mScreenWidth);
                this.setState({ selectedIndex: num }, () => {
                    this.path.setValue(num);
                });
                this.props.onScrollToIndex && this.props.onScrollToIndex(num);

                let x_loacation = this.itemLayout[num].x;
                if (x_loacation + this.itemLayout[num].width < Const.mScreenWidth) {
                    this.scroll.scrollTo({ x: 0, y: 0, animated: true })
                } else if (x_loacation + this.itemLayout[num].width > Const.mScreenWidth && this.itemLayout[this.state.titleArr.length - 1].x - x_loacation > Const.mScreenWidth) {
                    this.scroll.scrollTo({ x: (x_loacation - Const.mScreenWidth) + Const.mScreenWidth / 2, y: 0, animated: true })
                } else {
                    this.scroll.scrollToEnd();
                }
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
            initialPage={this.state.initialPage}
            scrollEnabled={true}
            onPageSelected={(e) => {
                let num = e.nativeEvent.position
                this.props.onScrollToIndex && this.props.onScrollToIndex(num)
                this.setState({ selectedIndex: num }, () => {
                    this.path.setValue(num);
                });

                let x_loacation = this.itemLayout[num].x;
                if (x_loacation + this.itemLayout[num].width < Const.mScreenWidth) {
                    this.scroll.scrollTo({ x: 0, y: 0, animated: true })
                } else if (x_loacation + this.itemLayout[num].width > Const.mScreenWidth && this.itemLayout[this.state.titleArr.length - 1].x - x_loacation > Const.mScreenWidth) {
                    this.scroll.scrollTo({ x: (x_loacation - Const.mScreenWidth) + Const.mScreenWidth / 2, y: 0, animated: true })
                } else {
                    this.scroll.scrollToEnd();
                }
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
