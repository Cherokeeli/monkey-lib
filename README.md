# greasymonkey脚本

# timing-click

淘宝，京东秒杀点击脚本
输入秒杀时间和点击按钮的ID，点击准备开抢
静静等待进入付款页面的喜悦

TIP，如何获取点击按钮ID?对需要点击的按钮右键-检查，在新的窗口中的Element页看到按钮的HTML代码，右键该HTML节点-Copy-Copy selector，然后粘贴到抢按钮选择器中

Github: https://github.com/Cherokeeli/monkey-lib
用的顺手的话可以顺手来个star~
# 0.3.1
加入对天猫的支持
最近Github炸了，换资源地址至码云
修改点击事件逻辑，会连续点几次
点击时间初始化为当前时间

# 0.3
使用webworker线程，计时更加准确；
加入日期格式输入框

# 0.2
原生+jquery点击，以免页面脚本点击函数被禁用

# 0.1
脚本建立