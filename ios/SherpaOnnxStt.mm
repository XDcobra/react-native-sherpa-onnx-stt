#import "SherpaOnnxStt.h"
#import <React/RCTUtils.h>
#import <React/RCTLog.h>

@implementation SherpaOnnxStt
- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);

    return result;
}

- (void)resolveModelPath:(NSDictionary *)config
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject
{
    NSString *type = config[@"type"] ?: @"auto";
    NSString *path = config[@"path"];
    
    if (!path) {
        reject(@"PATH_REQUIRED", @"Path is required", nil);
        return;
    }
    
    NSError *error = nil;
    NSString *resolvedPath = nil;
    
    if ([type isEqualToString:@"asset"]) {
        resolvedPath = [self resolveAssetPath:path error:&error];
    } else if ([type isEqualToString:@"file"]) {
        resolvedPath = [self resolveFilePath:path error:&error];
    } else if ([type isEqualToString:@"auto"]) {
        resolvedPath = [self resolveAutoPath:path error:&error];
    } else {
        NSString *errorMsg = [NSString stringWithFormat:@"Unknown path type: %@", type];
        reject(@"INVALID_TYPE", errorMsg, nil);
        return;
    }
    
    if (error) {
        reject(@"PATH_RESOLVE_ERROR", error.localizedDescription, error);
        return;
    }
    
    resolve(resolvedPath);
}

- (NSString *)resolveAssetPath:(NSString *)assetPath error:(NSError **)error
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    // First, try to find directly in bundle (for folder references)
    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:assetPath ofType:nil];
    
    if (bundlePath && [fileManager fileExistsAtPath:bundlePath]) {
        return bundlePath;
    }
    
    // Try with directory structure (for resources in subdirectories)
    NSArray *pathComponents = [assetPath componentsSeparatedByString:@"/"];
    if (pathComponents.count > 1) {
        NSString *directory = pathComponents[0];
        for (NSInteger i = 1; i < pathComponents.count - 1; i++) {
            directory = [directory stringByAppendingPathComponent:pathComponents[i]];
        }
        NSString *resourceName = pathComponents.lastObject;
        bundlePath = [[NSBundle mainBundle] pathForResource:resourceName ofType:nil inDirectory:directory];
        
        if (bundlePath && [fileManager fileExistsAtPath:bundlePath]) {
            return bundlePath;
        }
    }
    
    // If not found in bundle, try to copy from bundle to Documents
    NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    NSString *targetDir = [documentsPath stringByAppendingPathComponent:@"models"];
    NSString *modelDir = [targetDir stringByAppendingPathComponent:[assetPath lastPathComponent]];
    
    // Check if already copied
    if ([fileManager fileExistsAtPath:modelDir]) {
        return modelDir;
    }
    
    // Try to find and copy from bundle resource path
    NSString *bundleResourcePath = [[NSBundle mainBundle] resourcePath];
    NSString *sourcePath = [bundleResourcePath stringByAppendingPathComponent:assetPath];
    
    if ([fileManager fileExistsAtPath:sourcePath]) {
        NSError *copyError = nil;
        [fileManager createDirectoryAtPath:targetDir withIntermediateDirectories:YES attributes:nil error:&copyError];
        if (copyError) {
            if (error) *error = copyError;
            return nil;
        }
        
        // Copy recursively if it's a directory
        BOOL isDirectory = NO;
        [fileManager fileExistsAtPath:sourcePath isDirectory:&isDirectory];
        
        if (isDirectory) {
            [fileManager copyItemAtPath:sourcePath toPath:modelDir error:&copyError];
        } else {
            [fileManager copyItemAtPath:sourcePath toPath:modelDir error:&copyError];
        }
        
        if (copyError) {
            if (error) *error = copyError;
            return nil;
        }
        
        return modelDir;
    }
    
    if (error) {
        *error = [NSError errorWithDomain:@"SherpaOnnxStt"
                                      code:1
                                  userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"Asset path not found: %@", assetPath]}];
    }
    return nil;
}

- (NSString *)resolveFilePath:(NSString *)filePath error:(NSError **)error
{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isDirectory = NO;
    BOOL exists = [fileManager fileExistsAtPath:filePath isDirectory:&isDirectory];
    
    if (!exists) {
        if (error) {
            *error = [NSError errorWithDomain:@"SherpaOnnxStt"
                                          code:2
                                      userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"File path does not exist: %@", filePath]}];
        }
        return nil;
    }
    
    if (!isDirectory) {
        if (error) {
            *error = [NSError errorWithDomain:@"SherpaOnnxStt"
                                          code:3
                                      userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"Path is not a directory: %@", filePath]}];
        }
        return nil;
    }
    
    return [filePath stringByStandardizingPath];
}

- (NSString *)resolveAutoPath:(NSString *)path error:(NSError **)error
{
    // Try asset first
    NSError *assetError = nil;
    NSString *resolvedPath = [self resolveAssetPath:path error:&assetError];
    
    if (resolvedPath) {
        return resolvedPath;
    }
    
    // If asset fails, try file system
    NSError *fileError = nil;
    resolvedPath = [self resolveFilePath:path error:&fileError];
    
    if (resolvedPath) {
        return resolvedPath;
    }
    
    // Both failed
    if (error) {
        NSString *errorMessage = [NSString stringWithFormat:@"Path not found as asset or file: %@. Asset error: %@, File error: %@",
                                   path,
                                   assetError.localizedDescription ?: @"Unknown",
                                   fileError.localizedDescription ?: @"Unknown"];
        *error = [NSError errorWithDomain:@"SherpaOnnxStt"
                                      code:4
                                  userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
    }
    return nil;
}

- (void)initializeSherpaOnnx:(NSString *)modelDir
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject
{
    RCTLogInfo(@"Initializing sherpa-onnx with modelDir: %@", modelDir);
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    // Verify model directory exists
    BOOL isDirectory = NO;
    BOOL exists = [fileManager fileExistsAtPath:modelDir isDirectory:&isDirectory];
    
    if (!exists) {
        NSString *errorMsg = [NSString stringWithFormat:@"Model directory does not exist: %@", modelDir];
        RCTLogError(@"%@", errorMsg);
        reject(@"INIT_ERROR", errorMsg, nil);
        return;
    }
    
    if (!isDirectory) {
        NSString *errorMsg = [NSString stringWithFormat:@"Model path is not a directory: %@", modelDir];
        RCTLogError(@"%@", errorMsg);
        reject(@"INIT_ERROR", errorMsg, nil);
        return;
    }
    
    // Check for required model files
    NSError *listError = nil;
    NSArray *files = [fileManager contentsOfDirectoryAtPath:modelDir error:&listError];
    if (listError) {
        NSString *errorMsg = [NSString stringWithFormat:@"Failed to list model directory: %@", listError.localizedDescription];
        RCTLogError(@"%@", errorMsg);
        reject(@"INIT_ERROR", errorMsg, listError);
        return;
    }
    
    RCTLogInfo(@"Model directory contents: %@", [files componentsJoinedByString:@", "]);
    
    // TODO: Implement actual sherpa-onnx initialization
    // For now, just resolve successfully (stub implementation)
    RCTLogInfo(@"Sherpa-onnx initialized successfully (stub)");
    resolve(nil);
}

- (void)testSherpaInitWithResolver:(RCTPromiseResolveBlock)resolve
                    withRejecter:(RCTPromiseRejectBlock)reject
{
    // TODO: Implement actual test
    resolve(@"Sherpa-onnx test successful (stub)");
}

- (void)transcribeFile:(NSString *)filePath
          withResolver:(RCTPromiseResolveBlock)resolve
          withRejecter:(RCTPromiseRejectBlock)reject
{
    // TODO: Implement actual transcription
    reject(@"TRANSCRIBE_ERROR", @"Not implemented yet", nil);
}

- (void)unloadSherpaOnnxWithResolver:(RCTPromiseResolveBlock)resolve
                      withRejecter:(RCTPromiseRejectBlock)reject
{
    // TODO: Implement actual cleanup
    resolve(nil);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeSherpaOnnxSttSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"SherpaOnnxStt";
}

@end
