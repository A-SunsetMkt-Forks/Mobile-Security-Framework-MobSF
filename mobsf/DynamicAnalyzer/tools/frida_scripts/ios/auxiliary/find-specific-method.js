/* Description: Find a specific method in all classes in the app
 * Modified for MobSF
 * Mode: S+A
 * Version: 1.0
 * Credit: PassionFruit (https://github.com/chaitin/passionfruit/blob/master/agent/app/classdump.js) & https://github.com/interference-security/frida-scripts/blob/master/iOS
 * Author: @interference-security
 */
//Twitter: https://twitter.com/xploresec
//GitHub: https://github.com/interference-security
// Modified to support Frida 17.0.0+

function find_specific_method_in_all_classes(func_name)
{
    send("Searching for method [" + func_name + "] in all Classes");
    var free = new NativeFunction(Module.getGlobalExportByName('free'), 'void', ['pointer'])
    var copyClassNamesForImage = new NativeFunction(Module.getGlobalExportByName('objc_copyClassNamesForImage'), 'pointer', ['pointer', 'pointer'])
    var p = Memory.alloc(Process.pointerSize)
    p.writeUInt(0)
    var path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String()
    var pPath = Memory.allocUtf8String(path)
    var pClasses = copyClassNamesForImage(pPath, p)
    var count = p.readUInt()
    var classesArray = new Array(count)
    for (var i = 0; i < count; i++)
    {
        var pClassName = pClasses.add(i * Process.pointerSize).readPointer()
        classesArray[i] = pClassName.readUtf8String()
        var className = classesArray[i]
        //var methods = ObjC.classes[className].$methods;
        var methods = ObjC.classes[className].$ownMethods;
        for (var j = 0; j < methods.length; j++)
        {
            if(methods[j].includes(func_name))
            {
                send("[AUXILIARY] Class: " + className);
                send("[AUXILIARY] \t[-] Method: " + methods[j]);
                try
                {
                    send("[AUXILIARY] \t\t[-] Arguments Type: " + ObjC.classes[className][methods[j]].argumentTypes);
                    send("[AUXILIARY] \t\t[-] Return Type: " + ObjC.classes[className][methods[j]].returnType);
                }
                catch(err) {}
            }
        }
    }
    free(pClasses)
    send("Completed: Find specific Method in all Classes");
}


//Your function name goes here
var METHOD = '{{METHOD}}'
try {
    find_specific_method_in_all_classes(METHOD)
} catch(err) {}